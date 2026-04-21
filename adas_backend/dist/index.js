"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const purchaseOrder_controller_1 = require("./controllers/purchaseOrder.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.post('/api/orders', (req, res) => purchaseOrder_controller_1.purchaseOrderController.createOrder(req, res));
app.patch('/api/installments/:id/pay', (req, res) => purchaseOrder_controller_1.purchaseOrderController.recordPayment(req, res));
app.get('/api/suppliers/:id/balance', (req, res) => purchaseOrder_controller_1.purchaseOrderController.getSupplierBalance(req, res));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'ERP Backend is running' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
