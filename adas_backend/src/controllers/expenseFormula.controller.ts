import { Request, Response } from 'express';
import prisma from '../utils/prismaClient';

const EXPENSE_KEYS = [
  'tax', 'director', 'customs', 'transportation', 'workers',
  'stockExchange', 'forensics', 'bank', 'textileMinistry',
  'export', 'minusConjugation', 'additionalExpenses',
] as const;

/**
 * Evaluate a formula string against a total item quantity.
 * "5%"    → 5% of totalQuantity
 * "12.50" → flat $12.50
 * "0"     → $0
 */
export function evaluateFormula(formula: string, totalQuantity: number): number {
  const trimmed = formula.trim();
  if (trimmed.endsWith('%')) {
    const pct = parseFloat(trimmed.slice(0, -1));
    if (isNaN(pct)) return 0;
    return (pct / 100) * totalQuantity;
  }
  const flat = parseFloat(trimmed);
  return isNaN(flat) ? 0 : flat;
}

export const expenseFormulaController = {
  async getAll(req: Request, res: Response) {
    try {
      const formulas = await prisma.expenseFormula.findMany({
        orderBy: { id: 'asc' },
      });
      res.json({ data: formulas });
    } catch (error) {
      console.error('getAll expenseFormulas error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, formula } = req.body;
      if (!name) return res.status(400).json({ message: 'Name is required' });

      // Generate a unique key from the name (e.g. "My Expense" -> "my_expense")
      const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      
      const newFormula = await prisma.expenseFormula.create({
        data: { name, key, formula: formula || '0' },
      });
      res.status(201).json({ data: newFormula });
    } catch (error: any) {
      console.error('create expenseFormula error:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Expense with this name already exists' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, formula } = req.body;
      
      let key: string | undefined;
      if (name) {
        key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      }

      const updated = await prisma.expenseFormula.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name, key }),
          ...(formula !== undefined && { formula }),
        },
      });
      res.json({ data: updated });
    } catch (error) {
      console.error('update expenseFormula error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.expenseFormula.delete({
        where: { id: Number(id) },
      });
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error('delete expenseFormula error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async bulkUpdate(req: Request, res: Response) {
    try {
      const { formulas } = req.body as {
        formulas: { key: string; name?: string; formula: string }[];
      };

      if (!Array.isArray(formulas)) {
        return res.status(400).json({ message: 'formulas must be an array' });
      }

      const results = await Promise.all(
        formulas.map((f) =>
          prisma.expenseFormula.upsert({
            where: { key: f.key },
            update: { formula: f.formula, ...(f.name && { name: f.name }) },
            create: { key: f.key, formula: f.formula, name: f.name || f.key },
          }),
        ),
      );

      res.json({ data: results });
    } catch (error) {
      console.error('bulkUpdate expenseFormulas error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
