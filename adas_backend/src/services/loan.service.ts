import { LoanType, LoanStatus, Prisma } from '@prisma/client';
import prisma from '../utils/prismaClient';

export class LoanService {
  async getLoans(
    type: LoanType,
    filters: { page?: number; pageSize?: number; status?: string; dateFrom?: string; dateTo?: string } = {}
  ) {
    const { page = 1, pageSize = 20, status, dateFrom, dateTo } = filters;

    const where: Prisma.LoanWhereInput = {
      type,
      ...(status && status !== 'ALL'
        ? status === 'NOT_CLOSED'
          ? { status: { not: 'CLOSED' } }
          : { status: status as LoanStatus }
        : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    // Fetch all matching loans (we group in memory for paginating by dispatch group)
    const allLoans = await prisma.loan.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });

    // Group by dispatchGroupId; fall back to individual id for legacy rows
    const groupMap = new Map<number, typeof allLoans>();
    for (const loan of allLoans) {
      const key = loan.dispatchGroupId ?? loan.id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(loan);
    }

    const groupEntries = Array.from(groupMap.entries());
    const total = groupEntries.length;
    const skip = (page - 1) * pageSize;
    const paginatedGroups = groupEntries.slice(skip, skip + pageSize);

    const list = paginatedGroups.map(([key, loans]) => {
      const first = loans[0];
      const totalAmount = loans.reduce((sum, l) => sum + Number(l.totalAmount), 0);
      const paidAmount = loans.reduce((sum, l) => sum + Number(l.paidAmount), 0);

      // Derive an overall group status
      const allClosed = loans.every((l) => l.status === 'CLOSED');
      const anyPartial = loans.some((l) => l.status === 'PARTIAL' || Number(l.paidAmount) > 0);
      const groupStatus: LoanStatus = allClosed ? 'CLOSED' : anyPartial ? 'PARTIAL' : 'OPEN';

      const lastPayDates = loans
        .map((l) => l.lastPayDate)
        .filter((d): d is Date => d !== null && d !== undefined);
      const lastPayDate =
        lastPayDates.length > 0
          ? new Date(Math.max(...lastPayDates.map((d) => d.getTime())))
          : null;

      return {
        dispatchGroupId: key,
        dispatchName: first.dispatchName || '',
        client: first.client,
        totalAmount,
        paidAmount,
        status: groupStatus,
        lastPayDate,
        items: loans,
      };
    });

    return { list, total };
  }

  async getSummary(type: LoanType, filters: { dateFrom?: string; dateTo?: string } = {}) {
    const { dateFrom, dateTo } = filters;
    const where: Prisma.LoanWhereInput = {
      type,
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    const [agg, openCount] = await Promise.all([
      prisma.loan.aggregate({
        where,
        _sum: { totalAmount: true, paidAmount: true },
      }),
      prisma.loan.count({ where: { ...where, status: { not: 'CLOSED' } } }),
    ]);

    const totalLoan = Number(agg._sum.totalAmount ?? 0);
    const totalPaid = Number(agg._sum.paidAmount ?? 0);

    return {
      totalDebt: Math.max(0, totalLoan - totalPaid),
      totalPaid,
      openCount,
    };
  }

  async payByMoney(loanId: number, amount: number, payDate?: string | Date) {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new Error('Loan not found');

      const newPaid = Number(loan.paidAmount) + amount;
      const total = Number(loan.totalAmount);
      const newStatus: LoanStatus = newPaid >= total ? 'CLOSED' : newPaid > 0 ? 'PARTIAL' : 'OPEN';

      return await tx.loan.update({
        where: { id: loanId },
        data: {
          paidAmount: { increment: amount },
          status: newStatus,
          ...(payDate && { lastPayDate: new Date(payDate) }),
        },
        include: { client: true },
      });
    });
  }

  async payByProduct(
    loanId: number,
    items: { productId: number; quantity: number; unitPrice: number }[],
    payDate?: string | Date,
  ) {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId }, include: { client: true } });
      if (!loan) throw new Error('Loan not found');

      const totalProductValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

      // Auto-note for the warehouse arrivals
      const clientName = loan.client.name_tm || loan.client.name_ru;
      const autoNote = `Auto: ${clientName} karzdan haryt ${loanId}`;

      const arrivalDate = payDate ? new Date(payDate) : new Date();

      // Create EXPORT warehouse arrivals for each item
      await Promise.all(
        items.map((item) =>
          tx.warehouseArrival.create({
            data: {
              warehouseType: 'EXPORT',
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: new Prisma.Decimal(item.quantity * item.unitPrice),
              clientId: loan.clientId,
              purchaseOrderId: loan.purchaseOrderId || undefined,
              note: autoNote,
              arrivalDate,
            },
          }),
        ),
      );

      const newPaid = Number(loan.paidAmount) + totalProductValue;
      const total = Number(loan.totalAmount);
      const newStatus: LoanStatus = newPaid >= total ? 'CLOSED' : 'PARTIAL';

      return await tx.loan.update({
        where: { id: loanId },
        data: {
          paidAmount: { increment: totalProductValue },
          status: newStatus,
          lastPayDate: arrivalDate,
        },
        include: { client: true },
      });
    });
  }

  async payGroupByMoney(groupId: number, amount: number, payDate?: string | Date) {
    return await prisma.$transaction(async (tx) => {
      // Find all loans in this group, ordered by creation (oldest first)
      const loans = await tx.loan.findMany({
        where: { OR: [{ dispatchGroupId: groupId }, { id: groupId }] },
        orderBy: { id: 'asc' },
        include: { client: true }
      });

      if (!loans || loans.length === 0) throw new Error('Loan group not found');

      let remainingPayment = amount;
      const updatedLoans = [];

      for (const loan of loans) {
        if (remainingPayment <= 0) break;

        const loanTotal = Number(loan.totalAmount);
        const loanPaid = Number(loan.paidAmount);
        const loanRemainingDebt = loanTotal - loanPaid;

        if (loanRemainingDebt > 0) {
          const paymentToApply = Math.min(remainingPayment, loanRemainingDebt);
          remainingPayment -= paymentToApply;

          const newPaid = loanPaid + paymentToApply;
          const newStatus: LoanStatus = newPaid >= loanTotal ? 'CLOSED' : newPaid > 0 ? 'PARTIAL' : 'OPEN';

          const updated = await tx.loan.update({
            where: { id: loan.id },
            data: {
              paidAmount: newPaid,
              status: newStatus,
              ...(payDate && { lastPayDate: new Date(payDate) }),
            },
            include: { client: true },
          });
          updatedLoans.push(updated);
        }
      }

      return updatedLoans;
    });
  }

  async payGroupByProduct(
    groupId: number,
    items: { productId: number; quantity: number; unitPrice: number }[],
    payDate?: string | Date,
  ) {
    return await prisma.$transaction(async (tx) => {
      const loans = await tx.loan.findMany({
        where: { OR: [{ dispatchGroupId: groupId }, { id: groupId }] },
        orderBy: { id: 'asc' },
        include: { client: true }
      });

      if (!loans || loans.length === 0) throw new Error('Loan group not found');
      
      // Use the client from the first loan (they should all belong to the same client)
      const firstLoan = loans[0];
      const clientName = firstLoan.client.name_tm || firstLoan.client.name_ru;
      const autoNote = `Auto: ${clientName} karzdan haryt topar ${groupId}`;

      const totalProductValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      const arrivalDate = payDate ? new Date(payDate) : new Date();

      // Create EXPORT warehouse arrivals for each item
      await Promise.all(
        items.map((item) =>
          tx.warehouseArrival.create({
            data: {
              warehouseType: 'EXPORT',
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: new Prisma.Decimal(item.quantity * item.unitPrice),
              clientId: firstLoan.clientId,
              purchaseOrderId: firstLoan.purchaseOrderId || undefined,
              note: autoNote,
              arrivalDate,
            },
          }),
        ),
      );

      let remainingPayment = totalProductValue;
      const updatedLoans = [];

      for (const loan of loans) {
        if (remainingPayment <= 0) break;

        const loanTotal = Number(loan.totalAmount);
        const loanPaid = Number(loan.paidAmount);
        const loanRemainingDebt = loanTotal - loanPaid;

        if (loanRemainingDebt > 0) {
          const paymentToApply = Math.min(remainingPayment, loanRemainingDebt);
          remainingPayment -= paymentToApply;

          const newPaid = loanPaid + paymentToApply;
          const newStatus: LoanStatus = newPaid >= loanTotal ? 'CLOSED' : newPaid > 0 ? 'PARTIAL' : 'OPEN';

          const updated = await tx.loan.update({
            where: { id: loan.id },
            data: {
              paidAmount: newPaid,
              status: newStatus,
              lastPayDate: arrivalDate,
            },
            include: { client: true },
          });
          updatedLoans.push(updated);
        }
      }

      return updatedLoans;
    });
  }
}

export const loanService = new LoanService();
