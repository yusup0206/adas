import prisma from '../utils/prismaClient';

export class MeasurementRepository {
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
      prisma.measurement.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.measurement.count({ where }),
    ]);

    return { list, total };
  }

  async findById(id: number) {
    return await prisma.measurement.findUnique({
      where: { id },
    });
  }

  async create(data: { name_tm: string; name_ru: string }) {
    return await prisma.measurement.create({
      data,
    });
  }

  async update(id: number, data: { name_tm?: string; name_ru?: string }) {
    return await prisma.measurement.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.measurement.delete({
      where: { id },
    });
  }
}

export const measurementRepository = new MeasurementRepository();
