import { Request, Response } from 'express';
import { measurementRepository } from '../repositories/measurement.repository';
import { z } from 'zod';

const MeasurementSchema = z.object({
  name_tm: z.string().min(1),
  name_ru: z.string().min(1),
});

export class MeasurementController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, page, pageSize } = req.query;
      const measurements = await measurementRepository.getAll({
        search: search as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const measurement = await measurementRepository.findById(Number(id));
      if (!measurement) return res.status(404).json({ message: 'Measurement not found' });
      res.json(measurement);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = MeasurementSchema.parse(req.body);
      const measurement = await measurementRepository.create(validatedData);
      res.status(201).json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = MeasurementSchema.partial().parse(req.body);
      const measurement = await measurementRepository.update(Number(id), validatedData);
      res.json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await measurementRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const measurementController = new MeasurementController();
