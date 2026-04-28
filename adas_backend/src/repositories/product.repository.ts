import prisma from '../utils/prismaClient';

export class ProductRepository {
  async findById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
      include: { unit: true },
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
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: { unit: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { list, total };
  }

  async create(data: {
    name_tm: string;
    name_ru: string;
    unitId?: number | null;
    productionCountry_tm?: string;
    productionCountry_ru?: string;
  }) {
    return await prisma.product.create({
      data,
    });
  }

  async update(id: number, data: {
    name_tm?: string;
    name_ru?: string;
    unitId?: number | null;
    productionCountry_tm?: string;
    productionCountry_ru?: string;
  }) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.product.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
