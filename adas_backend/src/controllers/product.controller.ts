import { Request, Response } from 'express';
import { productRepository } from '../repositories/product.repository';
import { z } from 'zod';

const ProductSchema = z.object({
  name_tm: z.string().min(1),
  name_ru: z.string().min(1),
  unitId: z.coerce.number().int().positive().optional().nullable(),
  productionCountry_tm: z.string().optional().default(""),
  productionCountry_ru: z.string().optional().default(""),
});

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, page, pageSize } = req.query;
      const products = await productRepository.getAll({
        search: search as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productRepository.findById(Number(id));
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = ProductSchema.parse(req.body);
      const product = await productRepository.create(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = ProductSchema.partial().parse(req.body);
      const product = await productRepository.update(Number(id), validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await productRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const productController = new ProductController();
