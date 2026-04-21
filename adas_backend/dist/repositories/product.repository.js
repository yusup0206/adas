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
        });
    }
    async getAll() {
        return await prismaClient_1.default.product.findMany();
    }
}
exports.ProductRepository = ProductRepository;
exports.productRepository = new ProductRepository();
