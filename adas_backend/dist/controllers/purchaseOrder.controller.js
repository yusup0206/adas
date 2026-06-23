"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderController = exports.PurchaseOrderController = void 0;
const zod_1 = require("zod");
const purchaseOrder_service_1 = require("../services/purchaseOrder.service");
const CreateOrderSchema = zod_1.z.object({
    orderName: zod_1.z.string().min(1),
    supplierId: zod_1.z.coerce.number(),
    totalPrice: zod_1.z.coerce.number().positive(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.coerce.number(),
        quantity: zod_1.z.coerce.number().int().positive(),
        unitPrice: zod_1.z.coerce.number().positive(),
    })).min(1),
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
            const { amount, payDate } = req.body;
            const result = await purchaseOrder_service_1.purchaseOrderService.recordPayment(Number(id), Number(amount), payDate);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await purchaseOrder_service_1.purchaseOrderService.updateOrderStatus(Number(id), status);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            await purchaseOrder_service_1.purchaseOrderService.deleteOrder(Number(id));
            res.status(204).send();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const result = await purchaseOrder_service_1.purchaseOrderService.updateOrder(Number(id), req.body);
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
    async getAllOrders(req, res) {
        try {
            const { search, page, pageSize, status, isPaid } = req.query;
            const filters = {
                search: search,
                page: page ? Number(page) : undefined,
                pageSize: pageSize ? Number(pageSize) : undefined,
                status: status,
                isPaid: isPaid === 'true' ? true : isPaid === 'false' ? false : undefined,
            };
            const result = await purchaseOrder_service_1.purchaseOrderService.getAllPurchaseOrders(filters);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getDebtSummary(req, res) {
        try {
            const summary = await purchaseOrder_service_1.purchaseOrderService.getDebtSummary();
            res.status(200).json(summary);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.PurchaseOrderController = PurchaseOrderController;
exports.purchaseOrderController = new PurchaseOrderController();
