import { Request, Response } from 'express';
import { z } from 'zod';
import { purchaseOrderService } from '../services/purchaseOrder.service';
import { OrderType } from '@prisma/client';

const CreateOrderSchema = z.object({
  supplierId: z.coerce.number(),
  type: z.nativeEnum(OrderType),
  totalPrice: z.coerce.number().positive(),
  durationMonths: z.coerce.number().min(3).max(12).optional(),
  items: z.array(z.object({
    productId: z.coerce.number(),
    quantity: z.coerce.number().int().positive(),
    unitPrice: z.coerce.number().positive(),
  })).min(1),
}).refine(data => {
  if (data.type === OrderType.INSTALLMENT && !data.durationMonths) {
    return false;
  }
  return true;
}, {
  message: "Duration months is required for installment orders",
  path: ["durationMonths"],
});

export class PurchaseOrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const validatedData = CreateOrderSchema.parse(req.body);
      const order = await purchaseOrderService.createPurchaseOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async recordPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await purchaseOrderService.recordPayment(Number(id));
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSupplierBalance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const balance = await purchaseOrderService.getSupplierBalance(Number(id));
      res.status(200).json(balance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  async getAllOrders(req: Request, res: Response) {
    try {
      const { page, pageSize } = req.query;
      const filters = {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      };
      const result = await purchaseOrderService.getAllPurchaseOrders(filters);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const purchaseOrderController = new PurchaseOrderController();
