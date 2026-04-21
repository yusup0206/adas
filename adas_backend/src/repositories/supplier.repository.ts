import prisma from '../utils/prismaClient';

export class SupplierRepository {
  async findById(id: number) {
    return await prisma.supplier.findUnique({
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
          ],
        }
      : {};

    const [list, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { list, total };
  }

  async create(data: { name_tm: string; name_ru: string }) {
    return await prisma.supplier.create({
      data,
    });
  }

  async update(id: number, data: { name_tm?: string; name_ru?: string }) {
    return await prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.supplier.delete({
      where: { id },
    });
  }

  async updateBalance(id: number, data: { totalAmount?: number; paidAmount?: number; remainingDebt?: number }) {
    return await prisma.supplier.update({
      where: { id },
      data,
    });
  }
}

export const supplierRepository = new SupplierRepository();
