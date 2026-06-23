"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = exports.ProductRepository = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class ProductRepository {
    async findById(id) {
        return await prismaClient_1.default.product.findUnique({
            where: { id },
            include: { unit: true },
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
            prismaClient_1.default.product.findMany({
                where,
                skip,
                take: pageSize,
                include: { unit: true },
                orderBy: { createdAt: 'desc' },
            }),
            prismaClient_1.default.product.count({ where }),
        ]);
        return { list, total };
    }
    async create(data) {
        return await prismaClient_1.default.product.create({
            data,
        });
    }
    async update(id, data) {
        return await prismaClient_1.default.product.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await prismaClient_1.default.product.delete({
            where: { id },
        });
    }
}
exports.ProductRepository = ProductRepository;
exports.productRepository = new ProductRepository();
