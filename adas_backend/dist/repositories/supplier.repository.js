"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRepository = exports.SupplierRepository = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class SupplierRepository {
    async findById(id) {
        return await prismaClient_1.default.supplier.findUnique({
            where: { id },
        });
    }
    async getAll(options) {
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
            prismaClient_1.default.supplier.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prismaClient_1.default.supplier.count({ where }),
        ]);
        return { list, total };
    }
    async create(data) {
        return await prismaClient_1.default.supplier.create({
            data,
        });
    }
    async update(id, data) {
        return await prismaClient_1.default.supplier.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prismaClient_1.default.supplier.delete({
            where: { id },
        });
    }
    async updateBalance(id, data) {
        return await prismaClient_1.default.supplier.update({
            where: { id },
            data,
        });
    }
}
exports.SupplierRepository = SupplierRepository;
exports.supplierRepository = new SupplierRepository();
