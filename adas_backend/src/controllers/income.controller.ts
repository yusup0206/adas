import { Request, Response } from 'express';
import prisma from '../utils/prismaClient';

export class IncomeController {
  async getIncomeSummary(req: Request, res: Response) {
    try {
      // Get all purchase order items with their products
      const orderItems = await prisma.purchaseOrderItem.findMany({
        include: {
          product: true,
          purchaseOrder: {
            include: {
              supplier: true
            }
          }
        },
        orderBy: {
          purchaseOrder: {
            orderDate: 'desc'
          }
        }
      });

      // Build per-product income breakdown
      const productMap = new Map<number, {
        productId: number;
        name_tm: string;
        name_ru: string;
        totalQuantity: number;
        totalCost: number;
        totalRevenue: number;
        totalProfit: number;
      }>();

      const transactions: any[] = [];
      let totalCost = 0;
      let totalRevenue = 0;

      for (const item of orderItems) {
        const costPrice = Number(item.unitPrice);
        const sellPrice = 0; // Removed from schema
        const buyPrice = 0; // Removed from schema

        const quantity = item.quantity;
        const itemCost = costPrice * quantity;
        const itemRevenue = sellPrice * quantity;
        const itemProfit = itemRevenue - itemCost;

        totalCost += itemCost;
        totalRevenue += itemRevenue;

        // Record individual transaction
        transactions.push({
          id: item.id,
          orderId: item.purchaseOrderId,
          date: item.purchaseOrder.orderDate,
          supplier: i18n_fallback_name(item.purchaseOrder.supplier),
          productName_tm: item.product.name_tm,
          productName_ru: item.product.name_ru,
          quantity,
          cost: itemCost,
          revenue: itemRevenue,
          profit: itemProfit,
        });

        const existing = productMap.get(item.productId);
        if (existing) {
          existing.totalQuantity += quantity;
          existing.totalCost += itemCost;
          existing.totalRevenue += itemRevenue;
          existing.totalProfit += itemProfit;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            name_tm: item.product.name_tm,
            name_ru: item.product.name_ru,
            totalQuantity: quantity,
            totalCost: itemCost,
            totalRevenue: itemRevenue,
            totalProfit: itemProfit,
          });
        }
      }

      const totalProfit = totalRevenue - totalCost;
      const products = Array.from(productMap.values());

      res.json({
        totalCost,
        totalRevenue,
        totalProfit,
        products,
        transactions,
      });
    } catch (error) {
      console.error('Income summary error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// Helper to handle name selection logic in backend if needed, 
// though usually we just send both and let frontend decide.
function i18n_fallback_name(obj: any) {
    if (!obj) return "-";
    return { tm: obj.name_tm, ru: obj.name_ru };
}

export const incomeController = new IncomeController();
