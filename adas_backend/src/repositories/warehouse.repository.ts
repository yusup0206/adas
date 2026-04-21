import prisma from '../utils/prismaClient';

export class WarehouseRepository {
  async findById(id: number) {
    return await prisma.warehouse.findUnique({
      where: { id },
    });
  }

  async getAll(options?: { search?: string; page?: number; pageSize?: number }) {
    const { search, page = 1, pageSize = 10 } = options || {};
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name_tm: { contains: search } },
            { name_ru: { contains: search } },
            { address_tm: { contains: search } },
            { address_ru: { contains: search } },
            { location: { contains: search } },
          ],
        }
      : {};

    const [list, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return { list, total };
  }

  async create(data: {
    name_tm: string;
    name_ru: string;
    address_tm?: string;
    address_ru?: string;
    location?: string;
  }) {
    return await prisma.warehouse.create({
      data,
    });
  }

  async update(id: number, data: {
    name_tm?: string;
    name_ru?: string;
    address_tm?: string;
    address_ru?: string;
    location?: string;
  }) {
    return await prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.warehouse.delete({
      where: { id },
    });
  }
}

export const warehouseRepository = new WarehouseRepository();
