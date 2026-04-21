import { Request, Response } from 'express';
import { supplierRepository } from '../repositories/supplier.repository';
import { z } from 'zod';

const SupplierSchema = z.object({
  name_tm: z.string().min(1),
  name_ru: z.string().min(1),
});

export class SupplierController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, page, pageSize } = req.query;
      const suppliers = await supplierRepository.getAll({
        search: search as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await supplierRepository.findById(Number(id));
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = SupplierSchema.parse(req.body);
      const supplier = await supplierRepository.create(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = SupplierSchema.partial().parse(req.body);
      const supplier = await supplierRepository.update(Number(id), validatedData);
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await supplierRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const supplierController = new SupplierController();
