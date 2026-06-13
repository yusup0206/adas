import prisma from '../utils/prismaClient';

export class ClientRepository {
  async getAll(options?: { search?: string; page?: number; pageSize?: number }) {
    const { search, page = 1, pageSize = 10 } = options || {};
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name_tm: { contains: search } },
            { name_ru: { contains: search } },
          ],
        }
      : {};

    const [list, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return { list, total };
  }

  async findById(id: number) {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name_tm: string;
    name_ru: string;
    address_tm?: string;
    address_ru?: string;
  }) {
    return prisma.client.create({
      data,
    });
  }

  async update(id: number, data: {
    name_tm?: string;
    name_ru?: string;
    address_tm?: string;
    address_ru?: string;
  }) {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.client.delete({
      where: { id },
    });
  }
}

export const clientRepository = new ClientRepository();
