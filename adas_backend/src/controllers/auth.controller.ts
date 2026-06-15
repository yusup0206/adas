import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey_please_change_in_production';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { username },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const permissions = user.role.permissions.map(rp => rp.permission.name);

      const accessToken = jwt.sign(
        { userId: user.id, username: user.username, role: user.role.name, permissions },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role.name,
          permissions,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging in' });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const permissions = user.role.permissions.map(rp => rp.permission.name);

      const accessToken = jwt.sign(
        { userId: user.id, username: user.username, role: user.role.name, permissions },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Rotate refresh token
      const newRefreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      console.error(error);
      res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { userId } = req.body; // In real app, might come from decoded token

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { refreshToken: null },
        });
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging out' });
    }
  }
};
