"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const purchaseOrder_controller_1 = require("./controllers/purchaseOrder.controller");
const supplier_controller_1 = require("./controllers/supplier.controller");
const product_controller_1 = require("./controllers/product.controller");
const client_controller_1 = require("./controllers/client.controller");
const measurement_controller_1 = require("./controllers/measurement.controller");
const income_controller_1 = require("./controllers/income.controller");
const warehouse_controller_1 = require("./controllers/warehouse.controller");
const auth_controller_1 = require("./controllers/auth.controller");
const user_controller_1 = require("./controllers/user.controller");
const role_controller_1 = require("./controllers/role.controller");
const permission_controller_1 = require("./controllers/permission.controller");
const loan_controller_1 = require("./controllers/loan.controller");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const permission_middleware_1 = require("./middlewares/permission.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
console.log('Registering routes...');
// Routes
// Auth routes
app.post('/api/auth/login', (req, res) => auth_controller_1.authController.login(req, res));
app.post('/api/auth/refresh', (req, res) => auth_controller_1.authController.refreshToken(req, res));
app.post('/api/auth/logout', (req, res) => auth_controller_1.authController.logout(req, res));
// User & Role routes
app.get('/api/users', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_USERS'), (req, res) => user_controller_1.userController.getAll(req, res));
app.get('/api/users/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_USERS'), (req, res) => user_controller_1.userController.getById(req, res));
app.post('/api/users', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_USERS'), (req, res) => user_controller_1.userController.create(req, res));
app.patch('/api/users/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_USERS'), (req, res) => user_controller_1.userController.update(req, res));
app.delete('/api/users/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_USERS'), (req, res) => user_controller_1.userController.delete(req, res));
app.get('/api/roles', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ROLES'), (req, res) => role_controller_1.roleController.getAll(req, res));
app.post('/api/roles', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ROLES'), (req, res) => role_controller_1.roleController.create(req, res));
app.patch('/api/roles/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ROLES'), (req, res) => role_controller_1.roleController.update(req, res));
app.delete('/api/roles/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ROLES'), (req, res) => role_controller_1.roleController.delete(req, res));
app.get('/api/permissions', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ROLES'), (req, res) => permission_controller_1.permissionController.getAll(req, res));
app.get('/api/measurements', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => measurement_controller_1.measurementController.getAll(req, res));
app.post('/api/measurements', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => measurement_controller_1.measurementController.create(req, res));
app.patch('/api/measurements/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => measurement_controller_1.measurementController.update(req, res));
app.delete('/api/measurements/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => measurement_controller_1.measurementController.delete(req, res));
app.get('/api/clients', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_CLIENTS'), (req, res) => client_controller_1.clientController.getAll(req, res));
app.post('/api/clients', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_CLIENTS'), (req, res) => client_controller_1.clientController.create(req, res));
app.patch('/api/clients/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_CLIENTS'), (req, res) => client_controller_1.clientController.update(req, res));
app.delete('/api/clients/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_CLIENTS'), (req, res) => client_controller_1.clientController.delete(req, res));
app.get('/api/suppliers', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_SUPPLIERS'), (req, res) => supplier_controller_1.supplierController.getAll(req, res));
app.get('/api/suppliers/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_SUPPLIERS'), (req, res) => supplier_controller_1.supplierController.getById(req, res));
app.post('/api/suppliers', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_SUPPLIERS'), (req, res) => supplier_controller_1.supplierController.create(req, res));
app.patch('/api/suppliers/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_SUPPLIERS'), (req, res) => supplier_controller_1.supplierController.update(req, res));
app.delete('/api/suppliers/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_SUPPLIERS'), (req, res) => supplier_controller_1.supplierController.delete(req, res));
app.get('/api/products', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => product_controller_1.productController.getAll(req, res));
app.get('/api/products/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => product_controller_1.productController.getById(req, res));
app.post('/api/products', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => product_controller_1.productController.create(req, res));
app.patch('/api/products/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => product_controller_1.productController.update(req, res));
app.delete('/api/products/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_PRODUCTS'), (req, res) => product_controller_1.productController.delete(req, res));
app.get('/api/orders', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ORDERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.getAllOrders(req, res));
app.get('/api/orders/debt-summary', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('VIEW_INCOME'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.getDebtSummary(req, res));
app.post('/api/orders', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ORDERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.createOrder(req, res));
app.patch('/api/orders/:id/pay', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ORDERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.recordPayment(req, res));
app.patch('/api/orders/:id/status', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ORDERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.updateOrderStatus(req, res));
app.patch('/api/orders/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ORDERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.updateOrder(req, res));
app.delete('/api/orders/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_ORDERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.deleteOrder(req, res));
app.get('/api/suppliers/:id/balance', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_SUPPLIERS'), (req, res) => purchaseOrder_controller_1.purchaseOrderController.getSupplierBalance(req, res));
app.get('/api/income', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('VIEW_INCOME'), (req, res) => income_controller_1.incomeController.getIncomeSummary(req, res));
// Warehouse routes
app.get('/api/warehouse/stock', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.getStock(req, res));
app.get('/api/warehouse/arrivals', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.getArrivals(req, res));
app.post('/api/warehouse/arrivals', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.createArrival(req, res));
app.delete('/api/warehouse/arrivals/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.deleteArrival(req, res));
app.get('/api/warehouse/dispatches', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.getDispatches(req, res));
app.post('/api/warehouse/dispatches', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.createDispatch(req, res));
app.delete('/api/warehouse/dispatches/:id', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => warehouse_controller_1.warehouseController.deleteDispatch(req, res));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'ERP Backend is running' });
});
// Loan routes
app.get('/api/loans', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => loan_controller_1.loanController.getLoans(req, res));
app.get('/api/loans/summary', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => loan_controller_1.loanController.getSummary(req, res));
app.post('/api/loans/:id/pay-money', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => loan_controller_1.loanController.payByMoney(req, res));
app.post('/api/loans/:id/pay-product', auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)('MANAGE_WAREHOUSE'), (req, res) => loan_controller_1.loanController.payByProduct(req, res));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
