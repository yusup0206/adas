"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderController = exports.PurchaseOrderController = void 0;
const zod_1 = require("zod");
const purchaseOrder_service_1 = require("../services/purchaseOrder.service");
const client_1 = require("@prisma/client");
const CreateOrderSchema = zod_1.z.object({
    supplierId: zod_1.z.number(),
    type: zod_1.z.nativeEnum(client_1.OrderType),
    totalPrice: zod_1.z.number().positive(),
    durationMonths: zod_1.z.number().min(3).max(12).optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.number(),
        quantity: zod_1.z.number().int().positive(),
        unitPrice: zod_1.z.number().positive(),
    })).min(1),
}).refine(data => {
    if (data.type === client_1.OrderType.INSTALLMENT && !data.durationMonths) {
        return false;
    }
    return true;
}, {
    message: "Duration months is required for installment orders",
    path: ["durationMonths"],
});
class PurchaseOrderController {
    async createOrder(req, res) {
        try {
            const validatedData = CreateOrderSchema.parse(req.body);
            const order = await purchaseOrder_service_1.purchaseOrderService.createPurchaseOrder(validatedData);
            res.status(201).json(order);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async recordPayment(req, res) {
        try {
            const { id } = req.params;
            const result = await purchaseOrder_service_1.purchaseOrderService.recordPayment(Number(id));
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getSupplierBalance(req, res) {
        try {
            const { id } = req.params;
            const balance = await purchaseOrder_service_1.purchaseOrderService.getSupplierBalance(Number(id));
            res.status(200).json(balance);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.PurchaseOrderController = PurchaseOrderController;
exports.purchaseOrderController = new PurchaseOrderController();
