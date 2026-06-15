import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const permissionController = {
  async getAll(req: Request, res: Response) {
    try {
      const permissions = await prisma.permission.findMany();
      res.json({ data: permissions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching permissions' });
    }
  }
};
