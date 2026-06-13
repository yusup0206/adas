import { Request, Response } from 'express';
import { z } from 'zod';
import { warehouseService } from '../services/warehouse.service';

type WarehouseType = 'IMPORT' | 'EXPORT';

const ArrivalSchema = z.object({
  warehouseType: z.enum(['IMPORT', 'EXPORT']),
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().positive(),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
  purchaseOrderId: z.coerce.number().int().positive().optional().nullable(),
  clientId: z.coerce.number().int().positive().optional().nullable(),
  note: z.string().optional().default(''),
  arrivalDate: z.string().optional(),
});

const DispatchSchema = z.object({
  warehouseType: z.enum(['IMPORT', 'EXPORT']),
  clientId: z.coerce.number().int().positive().optional().nullable(),
  note: z.string().optional().default(''),
  dispatchDate: z.string().optional(),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    sellPrice: z.coerce.number().min(0),
  })).min(1),
});

export class WarehouseController {
  async getStock(req: Request, res: Response) {
    try {
      const type = (req.query.type as string)?.toUpperCase() as WarehouseType;
      if (!type || !['IMPORT', 'EXPORT'].includes(type)) {
        return res.status(400).json({ message: 'Invalid warehouse type. Use IMPORT or EXPORT.' });
      }
      const stock = await warehouseService.getStock(type);
      res.json(stock);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getArrivals(req: Request, res: Response) {
    try {
      const type = (req.query.type as string)?.toUpperCase() as WarehouseType;
      if (!type || !['IMPORT', 'EXPORT'].includes(type)) {
        return res.status(400).json({ message: 'Invalid warehouse type' });
      }
      const { page, pageSize } = req.query;
      const result = await warehouseService.getArrivals(type, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createArrival(req: Request, res: Response) {
    try {
      const data = ArrivalSchema.parse(req.body);
      const arrival = await warehouseService.createArrival(data);
      res.status(201).json(arrival);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteArrival(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await warehouseService.deleteArrival(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDispatches(req: Request, res: Response) {
    try {
      const type = (req.query.type as string)?.toUpperCase() as WarehouseType;
      if (!type || !['IMPORT', 'EXPORT'].includes(type)) {
        return res.status(400).json({ message: 'Invalid warehouse type' });
      }
      const { page, pageSize } = req.query;
      const result = await warehouseService.getDispatches(type, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createDispatch(req: Request, res: Response) {
    try {
      const data = DispatchSchema.parse(req.body);
      const dispatch = await warehouseService.createDispatch(data);
      res.status(201).json(dispatch);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      if (error instanceof Error && error.message.includes('Insufficient stock')) {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteDispatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await warehouseService.deleteDispatch(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const warehouseController = new WarehouseController();
