import { Request, Response } from 'express';
import { agreementRepository } from '../repositories/agreement.repository';
import { z } from 'zod';

const AgreementSchema = z.object({
  agreementNumber: z.string().min(1),
  registeredDate: z.coerce.date().optional(),
  validDate: z.coerce.date().optional(),
  status: z.string().optional(),
  buyerClientId: z.number().nullable().optional(),
  sellerClientId: z.number().nullable().optional(),
  order_ids: z.array(z.number()).optional(),
});

export class AgreementController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, page, pageSize } = req.query;
      const agreements = await agreementRepository.getAll({
        search: search as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(agreements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agreement = await agreementRepository.findById(Number(id));
      if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
      res.json(agreement);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = AgreementSchema.parse(req.body);
      const agreement = await agreementRepository.create(validatedData);
      res.status(201).json(agreement);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = AgreementSchema.partial().parse(req.body);
      const agreement = await agreementRepository.update(Number(id), validatedData);
      res.json(agreement);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await agreementRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const agreementController = new AgreementController();
