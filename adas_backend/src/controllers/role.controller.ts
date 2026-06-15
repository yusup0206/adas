import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const roleController = {
  async getAll(req: Request, res: Response) {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      });
      
      const formattedRoles = roles.map(role => ({
        ...role,
        permissions: role.permissions.map(rp => rp.permission)
      }));

      res.json({ data: formattedRoles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching roles' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, permissionIds } = req.body; // permissionIds: number[]

      const newRole = await prisma.role.create({
        data: {
          name,
          permissions: {
            create: (permissionIds || []).map((id: number) => ({
              permission: { connect: { id } }
            }))
          }
        },
        include: {
          permissions: { include: { permission: true } }
        }
      });

      res.status(201).json({
        ...newRole,
        permissions: newRole.permissions.map(rp => rp.permission)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating role' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, permissionIds } = req.body;

      // Start transaction to delete old permissions and add new ones
      await prisma.$transaction([
        prisma.rolePermission.deleteMany({ where: { roleId: id } }),
        prisma.role.update({
          where: { id },
          data: {
            name,
            permissions: {
              create: (permissionIds || []).map((permId: number) => ({
                permissionId: permId
              }))
            }
          }
        })
      ]);

      const updatedRole = await prisma.role.findUnique({
        where: { id },
        include: { permissions: { include: { permission: true } } }
      });

      if (!updatedRole) return res.status(404).json({ message: 'Role not found' });

      res.json({
        ...updatedRole,
        permissions: updatedRole.permissions.map(rp => rp.permission)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating role' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      const roleInUse = await prisma.user.findFirst({ where: { roleId: id } });
      if (roleInUse) {
        return res.status(400).json({ message: 'Cannot delete role assigned to users' });
      }

      await prisma.role.delete({ where: { id } });
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting role' });
    }
  }
};
