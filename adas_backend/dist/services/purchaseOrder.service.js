"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderService = exports.PurchaseOrderService = void 0;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class PurchaseOrderService {
    async createPurchaseOrder(data) {
        return await prismaClient_1.default.$transaction(async (tx) => {
            // 1. Create the Purchase Order
            const order = await tx.purchaseOrder.create({
                data: {
                    supplierId: data.supplierId,
                    type: data.type,
                    totalPrice: data.totalPrice,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                        })),
                    },
                },
            });
            // 2. Handle Installments if type is INSTALLMENT
            if (data.type === 'INSTALLMENT' && data.durationMonths) {
                const installmentAmount = new client_1.Prisma.Decimal(data.totalPrice).div(data.durationMonths);
                await tx.paymentPlan.create({
                    data: {
                        purchaseOrderId: order.id,
                        durationMonths: data.durationMonths,
                        installments: {
                            create: Array.from({ length: data.durationMonths }).map((_, i) => {
                                const dueDate = new Date();
                                dueDate.setMonth(dueDate.getMonth() + i + 1);
                                return {
                                    amount: installmentAmount,
                                    dueDate,
                                    status: client_1.PaymentStatus.PENDING,
                                };
                            }),
                        },
                    },
                });
            }
            // 3. Update Supplier balance
            await tx.supplier.update({
                where: { id: data.supplierId },
                data: {
                    totalAmount: { increment: data.totalPrice },
                    remainingDebt: { increment: data.totalPrice },
                },
            });
            return order;
        });
    }
    async recordPayment(installmentId) {
        return await prismaClient_1.default.$transaction(async (tx) => {
            // 1. Update installment status
            const installment = await tx.installment.update({
                where: { id: installmentId },
                data: {
                    status: client_1.PaymentStatus.PAID,
                    paymentDate: new Date(),
                },
                include: {
                    paymentPlan: {
                        include: {
                            purchaseOrder: true,
                        },
                    },
                },
            });
            // 2. Update Supplier balance
            await tx.supplier.update({
                where: { id: installment.paymentPlan.purchaseOrder.supplierId },
                data: {
                    paidAmount: { increment: installment.amount },
                    remainingDebt: { decrement: installment.amount },
                },
            });
            return installment;
        });
    }
    async getSupplierBalance(supplierId) {
        return await prismaClient_1.default.supplier.findUnique({
            where: { id: supplierId },
            select: {
                totalAmount: true,
                paidAmount: true,
                remainingDebt: true,
            },
        });
    }
}
exports.PurchaseOrderService = PurchaseOrderService;
exports.purchaseOrderService = new PurchaseOrderService();
