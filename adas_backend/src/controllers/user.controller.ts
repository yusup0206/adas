import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const userController = {
  async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          roleId: true,
          role: { select: { name: true } },
          createdAt: true,
          updatedAt: true
        }
      });
      res.json({ data: users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          roleId: true,
          role: { select: { name: true } },
          createdAt: true,
          updatedAt: true
        }
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { username, password, roleId } = req.body;
      
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) return res.status(400).json({ message: 'Username already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          roleId: parseInt(roleId)
        },
        select: {
          id: true,
          username: true,
          roleId: true,
          createdAt: true
        }
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { username, password, roleId } = req.body;

      const dataToUpdate: any = {};
      if (username) dataToUpdate.username = username;
      if (roleId) dataToUpdate.roleId = parseInt(roleId);
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          username: true,
          roleId: true,
          updatedAt: true
        }
      });
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating user' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await prisma.user.delete({ where: { id } });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
};
