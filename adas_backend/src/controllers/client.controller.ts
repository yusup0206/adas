import { Request, Response } from 'express';
import { clientRepository } from '../repositories/client.repository';
import { z } from 'zod';

const ClientSchema = z.object({
  name_tm: z.string().min(1),
  name_ru: z.string().min(1),
  address_tm: z.string().optional().default(""),
  address_ru: z.string().optional().default(""),
});

export class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, page, pageSize } = req.query;
      const clients = await clientRepository.getAll({
        search: search as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = ClientSchema.parse(req.body);
      const client = await clientRepository.create(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = ClientSchema.partial().parse(req.body);
      const client = await clientRepository.update(Number(id), validatedData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await clientRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const clientController = new ClientController();
