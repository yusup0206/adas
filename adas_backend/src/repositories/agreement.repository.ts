import prisma from '../utils/prismaClient';

export class AgreementRepository {
  async getAll(options?: { search?: string; page?: number; pageSize?: number }) {
    const { search, page = 1, pageSize = 10 } = options || {};
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { agreementNumber: { contains: search } },
          ],
        }
      : {};

    const [list, total] = await Promise.all([
      prisma.agreement.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          buyerClient: true,
          sellerClient: true,
          purchaseOrders: {
            include: {
              supplier: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agreement.count({ where }),
    ]);

    return { list, total };
  }

  async findById(id: number) {
    return await prisma.agreement.findUnique({
      where: { id },
      include: {
        buyerClient: true,
        sellerClient: true,
        purchaseOrders: {
          include: {
            supplier: true,
            items: {
              include: {
                product: true,
              },
            },
            paymentPlan: {
              include: {
                installments: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: {
    agreementNumber: string;
    registeredDate?: Date;
    validDate?: Date;
    status?: string;
    buyerClientId?: number | null;
    sellerClientId?: number | null;
    order_ids?: number[];
  }) {
    const { order_ids, ...rest } = data;
    return await prisma.agreement.create({
      data: {
        ...rest,
        purchaseOrders: order_ids
          ? {
              connect: order_ids.map((id) => ({ id })),
            }
          : undefined,
      },
    });
  }

  async update(id: number, data: {
    agreementNumber?: string;
    registeredDate?: Date;
    validDate?: Date;
    status?: string;
    buyerClientId?: number | null;
    sellerClientId?: number | null;
    order_ids?: number[];
  }) {
    const { order_ids, ...rest } = data;
    return await prisma.agreement.update({
      where: { id },
      data: {
        ...rest,
        purchaseOrders: order_ids
          ? {
              set: order_ids.map((id) => ({ id })),
            }
          : undefined,
      },
    });
  }

  async delete(id: number) {
    return await prisma.agreement.delete({
      where: { id },
    });
  }
}

export const agreementRepository = new AgreementRepository();
