import { Request, Response } from 'express';
import prisma from '../utils/prismaClient';
import { evaluateFormula } from './expenseFormula.controller';

export class IncomeController {
  async getIncomeSummary(req: Request, res: Response) {
    try {
      // ── Run queries in PARALLEL ───────────────────────────────────────────
      const [orders, allDispatches, allLoans, allExportArrivals, formulaRows] = await Promise.all([
        prisma.purchaseOrder.findMany({
          include: {
            supplier: { select: { name_tm: true, name_ru: true } },
            items: {
              include: {
                product: { select: { name_tm: true, name_ru: true } },
              },
            },
            expenses: true,
          },
          orderBy: { orderDate: 'desc' },
        }),
        prisma.warehouseDispatch.findMany({
          include: {
            product: { select: { name_tm: true, name_ru: true } },
            client: { select: { name_tm: true, name_ru: true } },
          },
          orderBy: { dispatchDate: 'desc' },
        }),
        prisma.loan.findMany({
          include: {
            client: { select: { name_tm: true, name_ru: true } },
            purchaseOrder: { select: { orderName: true } },
          },
          orderBy: { lastPayDate: 'desc' },
        }),
        prisma.warehouseArrival.findMany({
          where: { warehouseType: 'EXPORT' },
        }),
        prisma.expenseFormula.findMany(),
      ]);

      // Build formula lookup map  key → formula string
      const formulaMap = new Map<string, string>(formulaRows.map((f) => [f.key, f.formula]));

      // Map loan IDs that are associated with dispatches to determine if cash/loan
      const loanDispatchIds = new Set(allLoans.map((l) => l.dispatchId).filter(Boolean));

      // ── Calculate Order-Centric Summary ───────────────────────────────────
      const ordersSummary = orders.map((order) => {
        const itemsCost = order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        const totalItemQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

        // Additional expenses — per-order values take priority; fall back to global formula
        const expenses = order.expenses?.expenses as Record<string, number> | undefined;
        let expensesTotal = 0;
        const expensesBreakdown: Record<string, number> = {};
        
        // Use all available keys from both global formulas and per-order overrides
        const allKeys = new Set([...formulaMap.keys(), ...(expenses ? Object.keys(expenses) : [])]);
        
        allKeys.forEach((key) => {
          const storedVal = expenses ? Number(expenses[key] ?? 0) : 0;
          const effectiveVal =
            !isNaN(storedVal) && storedVal !== 0
              ? storedVal // manual per-order override
              : evaluateFormula(formulaMap.get(key) ?? '0', totalItemQuantity); // global formula fallback
          expensesBreakdown[key] = effectiveVal;
          expensesTotal += effectiveVal;
        });

        const totalCost = itemsCost + expensesTotal;

        // Dispatches linked to this order
        const orderDispatches = allDispatches.filter((d) => d.purchaseOrderId === order.id);

        // Direct cash sales from IMPORT (where warehouseType is IMPORT and it is not a loan dispatch)
        const importDirectCashSales = orderDispatches
          .filter((d) => d.warehouseType === 'IMPORT' && !loanDispatchIds.has(d.id))
          .reduce((sum, d) => sum + Number(d.totalSellPrice), 0);

        // Barter arrivals for this order
        const orderBarterArrivals = allExportArrivals.filter((a) => a.purchaseOrderId === order.id);
        const barterReceivedTotal = orderBarterArrivals.reduce((sum, a) => sum + Number(a.totalPrice), 0);

        // Loans for this order
        const orderLoans = allLoans.filter((l) => l.purchaseOrderId === order.id);
        const importLoans = orderLoans.filter((l) => l.type === 'IMPORT');
        const importLoansPaidTotal = importLoans.reduce((sum, l) => sum + Number(l.paidAmount), 0);

        // Cash repayments of IMPORT loans (total paid amount minus barter portion)
        const importLoanCashRepayments = Math.max(0, importLoansPaidTotal - barterReceivedTotal);

        // EXPORT sales linked to this order (selling barter products)
        const exportSales = orderDispatches
          .filter((d) => d.warehouseType === 'EXPORT')
          .reduce((sum, d) => sum + Number(d.totalSellPrice), 0);

        const totalRevenue = importDirectCashSales + importLoanCashRepayments + exportSales;
        const totalProfit = totalRevenue - totalCost;

        return {
          id: order.id,
          orderName: order.orderName,
          orderDate: order.orderDate,
          supplier: order.supplier
            ? { tm: order.supplier.name_tm, ru: order.supplier.name_ru }
            : null,
          itemsCost,
          expensesTotal,
          expensesBreakdown,
          totalCost,
          importDirectCashSales,
          importLoanCashRepayments,
          barterReceivedTotal,
          exportSales,
          totalRevenue,
          totalProfit,
          status: order.status,
        };
      });

      // ── Calculate Direct / Unlinked Transactions ─────────────────────────
      const unlinkedDispatches = allDispatches.filter((d) => d.purchaseOrderId === null);
      const unlinkedLoans = allLoans.filter((l) => l.purchaseOrderId === null);

      const unlinkedImportDirectCashSales = unlinkedDispatches
        .filter((d) => d.warehouseType === 'IMPORT' && !loanDispatchIds.has(d.id))
        .reduce((sum, d) => sum + Number(d.totalSellPrice), 0);

      const unlinkedExportArrivals = allExportArrivals.filter((a) => a.purchaseOrderId === null);
      const unlinkedBarterReceivedTotal = unlinkedExportArrivals.reduce((sum, a) => sum + Number(a.totalPrice), 0);

      const unlinkedImportLoans = unlinkedLoans.filter((l) => l.type === 'IMPORT');
      const unlinkedImportLoansPaidTotal = unlinkedImportLoans.reduce((sum, l) => sum + Number(l.paidAmount), 0);
      const unlinkedImportLoanCashRepayments = Math.max(0, unlinkedImportLoansPaidTotal - unlinkedBarterReceivedTotal);

      const unlinkedExportSales = unlinkedDispatches
        .filter((d) => d.warehouseType === 'EXPORT')
        .reduce((sum, d) => sum + Number(d.totalSellPrice), 0);

      const unlinkedRevenue =
        unlinkedImportDirectCashSales + unlinkedImportLoanCashRepayments + unlinkedExportSales;

      const ordersList = [...ordersSummary];
      if (unlinkedRevenue > 0) {
        ordersList.push({
          id: 0,
          orderName: 'Direct / Unlinked Transactions',
          orderDate: new Date(),
          supplier: null,
          itemsCost: 0,
          expensesTotal: 0,
          expensesBreakdown: {},
          totalCost: 0,
          importDirectCashSales: unlinkedImportDirectCashSales,
          importLoanCashRepayments: unlinkedImportLoanCashRepayments,
          barterReceivedTotal: unlinkedBarterReceivedTotal,
          exportSales: unlinkedExportSales,
          totalRevenue: unlinkedRevenue,
          totalProfit: unlinkedRevenue,
          status: 'RECEIVED' as any,
        });
      }

      // ── Aggregate Global Totals ──────────────────────────────────────────
      const totalCost = ordersSummary.reduce((sum, o) => sum + o.totalCost, 0);
      const totalRevenue = ordersSummary.reduce((sum, o) => sum + o.totalRevenue, 0) + unlinkedRevenue;
      const totalProfit = totalRevenue - totalCost;

      // ── Build Compatibility Lists ─────────────────────────────────────────

      // 1. Sales (Dispatches) List
      const sales = allDispatches.map((d) => ({
        id: d.id,
        productId: d.productId,
        date: d.dispatchDate,
        productName_tm: d.product.name_tm,
        productName_ru: d.product.name_ru,
        client: d.client ? { tm: d.client.name_tm, ru: d.client.name_ru } : null,
        quantity: d.quantity,
        sellPrice: Number(d.sellPrice),
        totalSellPrice: Number(d.totalSellPrice),
        warehouseType: d.warehouseType,
        note: d.note,
      }));

      // 2. Loan Repayments List
      const loanRepayments = allLoans
        .filter((l) => Number(l.paidAmount) > 0)
        .map((l) => ({
          id: l.id,
          type: l.type,
          client: l.client ? { tm: l.client.name_tm, ru: l.client.name_ru } : null,
          paidAmount: Number(l.paidAmount),
          lastPayDate: l.lastPayDate,
          purchaseOrderId: l.purchaseOrderId,
          purchaseOrderName: l.purchaseOrder?.orderName || null,
        }));

      // 3. Purchases (Flattened Order Items with allocated expenses)
      const purchases: any[] = [];
      orders.forEach((order) => {
        const expenses = order.expenses?.expenses as Record<string, number> | undefined;
        const totalItemQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        const allKeys = new Set([...formulaMap.keys(), ...(expenses ? Object.keys(expenses) : [])]);

        const expensesTotal = Array.from(allKeys).reduce((sum, key) => {
          const storedVal = expenses ? Number(expenses[key] ?? 0) : 0;
          const effectiveVal =
            !isNaN(storedVal) && storedVal !== 0
              ? storedVal
              : evaluateFormula(formulaMap.get(key) ?? '0', totalItemQuantity);
          return sum + effectiveVal;
        }, 0);

        const itemsCost = order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

        order.items.forEach((item) => {
          const cost = Number(item.totalPrice);
          const allocatedExpense = itemsCost > 0 ? expensesTotal * (cost / itemsCost) : 0;

          purchases.push({
            id: item.id,
            productId: item.productId,
            orderId: item.purchaseOrderId,
            orderName: order.orderName,
            date: order.orderDate,
            productName_tm: item.product.name_tm,
            productName_ru: item.product.name_ru,
            supplier: order.supplier
              ? { tm: order.supplier.name_tm, ru: order.supplier.name_ru }
              : null,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalCost: cost,
            expensesTotal: allocatedExpense,
          });
        });
      });

      // 4. Products Summary (grouped by product, with landed costs)
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

      sales.forEach((d) => {
        const revenue = d.totalSellPrice;
        const existing = productMap.get(d.productId ?? 0) || Array.from(productMap.values()).find(x => x.name_tm === d.productName_tm);
        const productId = d.productId ?? (existing ? existing.productId : 0);
        if (existing) {
          existing.quantitySold += d.quantity;
          existing.totalRevenue += revenue;
        } else {
          // Find matching dispatch item product ID
          const rawDispatch = allDispatches.find((x) => x.id === d.id);
          const pid = rawDispatch ? rawDispatch.productId : 0;
          productMap.set(pid, {
            productId: pid,
            name_tm: d.productName_tm,
            name_ru: d.productName_ru,
            quantitySold: d.quantity,
            quantityPurchased: 0,
            totalRevenue: revenue,
            totalCost: 0,
            totalProfit: 0,
          });
        }
      });

      purchases.forEach((p) => {
        const cost = p.totalCost + p.expensesTotal;
        const existing = productMap.get(p.productId);
        if (existing) {
          existing.quantityPurchased += p.quantity;
          existing.totalCost += cost;
        } else {
          productMap.set(p.productId, {
            productId: p.productId,
            name_tm: p.productName_tm,
            name_ru: p.productName_ru,
            quantitySold: 0,
            quantityPurchased: p.quantity,
            totalRevenue: 0,
            totalCost: cost,
            totalProfit: 0,
          });
        }
      });

      const products = Array.from(productMap.values()).map((p) => ({
        ...p,
        totalProfit: p.totalRevenue - p.totalCost,
      }));

      res.json({
        totalRevenue,
        totalCost,
        totalProfit,
        orders: ordersList,
        products,
        sales,
        purchases,
        loanRepayments,
      });
    } catch (error) {
      console.error('Income summary error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const incomeController = new IncomeController();
