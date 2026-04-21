import prisma from '../utils/prismaClient';

export class ClientRepository {
  async getAll() {
    return prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name_tm: string;
    name_ru: string;
    directorName_tm?: string;
    directorName_ru?: string;
    address_tm?: string;
    address_ru?: string;
    bankName_tm?: string;
    bankName_ru?: string;
    swift?: string;
    accountNo?: string;
    currentAccount?: string;
    correspondentAccount?: string;
    bankIdCode?: string;
    individualIdNumber?: string;
  }) {
    return prisma.client.create({
      data,
    });
  }

  async update(id: number, data: {
    name_tm?: string;
    name_ru?: string;
    directorName_tm?: string;
    directorName_ru?: string;
    address_tm?: string;
    address_ru?: string;
    bankName_tm?: string;
    bankName_ru?: string;
    swift?: string;
    accountNo?: string;
    currentAccount?: string;
    correspondentAccount?: string;
    bankIdCode?: string;
    individualIdNumber?: string;
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
