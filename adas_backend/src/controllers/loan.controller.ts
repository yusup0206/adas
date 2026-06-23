import { Request, Response } from 'express';
import { loanService } from '../services/loan.service';
import type { LoanType } from '@prisma/client';

export class LoanController {
  async getLoans(req: Request, res: Response) {
    try {
      const { type, page, pageSize, status, dateFrom, dateTo } = req.query;
      const result = await loanService.getLoans(type as LoanType, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const { type, dateFrom, dateTo } = req.query;
      const result = await loanService.getSummary(type as LoanType, {
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async payByMoney(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount, payDate } = req.body;
      const result = await loanService.payByMoney(Number(id), Number(amount), payDate);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async payByProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { items, payDate } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'items are required' });
      }
      const result = await loanService.payByProduct(Number(id), items, payDate);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async payGroupByMoney(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { amount, payDate } = req.body;
      const result = await loanService.payGroupByMoney(Number(groupId), Number(amount), payDate);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async payGroupByProduct(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { items, payDate } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'items are required' });
      }
      const result = await loanService.payGroupByProduct(Number(groupId), items, payDate);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const loanController = new LoanController();
