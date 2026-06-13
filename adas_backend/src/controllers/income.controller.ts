import { Request, Response } from 'express';
import prisma from '../utils/prismaClient';

export class IncomeController {
  async getIncomeSummary(req: Request, res: Response) {
    try {
      // ── Run both heavy queries in PARALLEL ─────────────────────────────────
      const [dispatches, orderItems] = await Promise.all([
        prisma.warehouseDispatch.findMany({
          select: {
            id: true,
            dispatchDate: true,
            productId: true,
            product: { select: { name_tm: true, name_ru: true } },
            client: { select: { name_tm: true, name_ru: true } },
            quantity: true,
            sellPrice: true,
            totalSellPrice: true,
            warehouseType: true,
            note: true,
          },
          orderBy: { dispatchDate: 'desc' },
        }),
        prisma.purchaseOrderItem.findMany({
          select: {
            id: true,
            purchaseOrderId: true,
            productId: true,
            product: { select: { name_tm: true, name_ru: true } },
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            purchaseOrder: {
              select: {
                orderDate: true,
                supplier: { select: { name_tm: true, name_ru: true } },
              },
            },
          },
          orderBy: { purchaseOrder: { orderDate: 'desc' } },
        }),
      ]);

      // ── Aggregate totals ───────────────────────────────────────────────────
      let totalRevenue = 0;
      let totalCost = 0;

      // ── Per-product map ────────────────────────────────────────────────────
      const productMap = new Map<
        number,
        {
          productId: number;
          name_tm: string;
          name_ru: string;
          quantitySold: number;
          quantityPurchased: number;
          totalRevenue: number;
          totalCost: number;
          totalProfit: number;
        }
      >();

      // Build dispatch (sales) list
      const sales = dispatches.map((d) => {
        const revenue = Number(d.totalSellPrice);
        totalRevenue += revenue;

        const existing = productMap.get(d.productId);
        if (existing) {
          existing.quantitySold += d.quantity;
          existing.totalRevenue += revenue;
        } else {
          productMap.set(d.productId, {
            productId: d.productId,
            name_tm: d.product.name_tm,
            name_ru: d.product.name_ru,
            quantitySold: d.quantity,
            quantityPurchased: 0,
            totalRevenue: revenue,
            totalCost: 0,
            totalProfit: 0,
          });
        }

        return {
          id: d.id,
          date: d.dispatchDate,
          productName_tm: d.product.name_tm,
          productName_ru: d.product.name_ru,
          client: d.client ? { tm: d.client.name_tm, ru: d.client.name_ru } : null,
          quantity: d.quantity,
          sellPrice: Number(d.sellPrice),
          totalSellPrice: revenue,
          warehouseType: d.warehouseType,
          note: d.note,
        };
      });

      // Build purchase (cost) list
      const purchases = orderItems.map((item) => {
        const cost = Number(item.totalPrice);
        totalCost += cost;

        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantityPurchased += item.quantity;
          existing.totalCost += cost;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            name_tm: item.product.name_tm,
            name_ru: item.product.name_ru,
            quantitySold: 0,
            quantityPurchased: item.quantity,
            totalRevenue: 0,
            totalCost: cost,
            totalProfit: 0,
          });
        }

        return {
          id: item.id,
          orderId: item.purchaseOrderId,
          date: item.purchaseOrder.orderDate,
          productName_tm: item.product.name_tm,
          productName_ru: item.product.name_ru,
          supplier: item.purchaseOrder.supplier
            ? { tm: item.purchaseOrder.supplier.name_tm, ru: item.purchaseOrder.supplier.name_ru }
            : null,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalCost: cost,
        };
      });

      // ── Recalculate profit per product: simply revenue - cost ──────────────
      const products = Array.from(productMap.values()).map((p) => ({
        ...p,
        totalProfit: p.totalRevenue - p.totalCost,
      }));

      const totalProfit = totalRevenue - totalCost;

      res.json({
        totalRevenue,
        totalCost,
        totalProfit,
        products,
        sales,
        purchases,
      });
    } catch (error) {
      console.error('Income summary error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const incomeController = new IncomeController();
