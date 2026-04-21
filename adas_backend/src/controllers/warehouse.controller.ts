import { Request, Response } from 'express';
import { warehouseRepository } from '../repositories/warehouse.repository';
import { z } from 'zod';

const WarehouseSchema = z.object({
  name_tm: z.string().min(1),
  name_ru: z.string().min(1),
  address_tm: z.string().optional().default(""),
  address_ru: z.string().optional().default(""),
  location: z.string().optional(),
});

export class WarehouseController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, page, pageSize } = req.query;
      const warehouses = await warehouseRepository.getAll({
        search: search as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouse = await warehouseRepository.findById(Number(id));
      if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = WarehouseSchema.parse(req.body);
      const warehouse = await warehouseRepository.create(validatedData);
      res.status(201).json(warehouse);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = WarehouseSchema.partial().parse(req.body);
      const warehouse = await warehouseRepository.update(Number(id), validatedData);
      res.json(warehouse);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await warehouseRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const warehouseController = new WarehouseController();
