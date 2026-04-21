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
    async getAll() {
        return await prismaClient_1.default.supplier.findMany();
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
