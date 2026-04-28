import { Request, Response } from 'express';
import { z } from 'zod';
import { purchaseOrderService } from '../services/purchaseOrder.service';
const CreateOrderSchema = z.object({
  supplierId: z.coerce.number(),
  totalPrice: z.coerce.number().positive(),
  items: z.array(z.object({
    productId: z.coerce.number(),
    quantity: z.coerce.number().int().positive(),
    unitPrice: z.coerce.number().positive(),
  })).min(1),
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
      const { amount } = req.body;
      const result = await purchaseOrderService.recordPayment(Number(id), Number(amount));
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await purchaseOrderService.updateOrderStatus(Number(id), status);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await purchaseOrderService.deleteOrder(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await purchaseOrderService.updateOrder(Number(id), req.body);
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
      const { page, pageSize, status } = req.query;
      const filters = {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as string,
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
