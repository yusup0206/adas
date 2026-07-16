import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { purchaseOrderController } from './controllers/purchaseOrder.controller';
import { supplierController } from './controllers/supplier.controller';
import { productController } from './controllers/product.controller';
import { clientController } from './controllers/client.controller';
import { measurementController } from './controllers/measurement.controller';
import { incomeController } from './controllers/income.controller';
import { warehouseController } from './controllers/warehouse.controller';
import { authController } from './controllers/auth.controller';
import { userController } from './controllers/user.controller';
import { roleController } from './controllers/role.controller';
import { permissionController } from './controllers/permission.controller';
import { loanController } from './controllers/loan.controller';
import { expenseFormulaController } from './controllers/expenseFormula.controller';
import { authenticateToken } from './middlewares/auth.middleware';
import { requirePermission } from './middlewares/permission.middleware';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('Registering routes...');

// ─── Auth routes (no permission required) ─────────────────────────────────────
app.post('/api/auth/login',   (req, res) => authController.login(req, res));
app.post('/api/auth/refresh', (req, res) => authController.refreshToken(req, res));
app.post('/api/auth/logout',  (req, res) => authController.logout(req, res));

// ─── Users ────────────────────────────────────────────────────────────────────
app.get(   '/api/users',     authenticateToken, requirePermission('USERS_VIEW'),   (req, res) => userController.getAll(req, res));
app.get(   '/api/users/:id', authenticateToken, requirePermission('USERS_VIEW'),   (req, res) => userController.getById(req, res));
app.post(  '/api/users',     authenticateToken, requirePermission('USERS_CREATE'), (req, res) => userController.create(req, res));
app.patch( '/api/users/:id', authenticateToken, requirePermission('USERS_UPDATE'), (req, res) => userController.update(req, res));
app.delete('/api/users/:id', authenticateToken, requirePermission('USERS_DELETE'), (req, res) => userController.delete(req, res));

// ─── Roles ────────────────────────────────────────────────────────────────────
app.get(   '/api/roles',     authenticateToken, requirePermission('ROLES_VIEW'),   (req, res) => roleController.getAll(req, res));
app.post(  '/api/roles',     authenticateToken, requirePermission('ROLES_CREATE'), (req, res) => roleController.create(req, res));
app.patch( '/api/roles/:id', authenticateToken, requirePermission('ROLES_UPDATE'), (req, res) => roleController.update(req, res));
app.delete('/api/roles/:id', authenticateToken, requirePermission('ROLES_DELETE'), (req, res) => roleController.delete(req, res));

// ─── Permissions (meta list for role editor) ──────────────────────────────────
app.get('/api/permissions', authenticateToken, requirePermission('ROLES_VIEW'), (req, res) => permissionController.getAll(req, res));

// ─── Units / Measurements ─────────────────────────────────────────────────────
app.get(   '/api/measurements',     authenticateToken, requirePermission('UNITS_VIEW'),   (req, res) => measurementController.getAll(req, res));
app.post(  '/api/measurements',     authenticateToken, requirePermission('UNITS_CREATE'), (req, res) => measurementController.create(req, res));
app.patch( '/api/measurements/:id', authenticateToken, requirePermission('UNITS_UPDATE'), (req, res) => measurementController.update(req, res));
app.delete('/api/measurements/:id', authenticateToken, requirePermission('UNITS_DELETE'), (req, res) => measurementController.delete(req, res));

// ─── Clients ──────────────────────────────────────────────────────────────────
app.get(   '/api/clients',     authenticateToken, requirePermission('CLIENTS_VIEW'),   (req, res) => clientController.getAll(req, res));
app.post(  '/api/clients',     authenticateToken, requirePermission('CLIENTS_CREATE'), (req, res) => clientController.create(req, res));
app.patch( '/api/clients/:id', authenticateToken, requirePermission('CLIENTS_UPDATE'), (req, res) => clientController.update(req, res));
app.delete('/api/clients/:id', authenticateToken, requirePermission('CLIENTS_DELETE'), (req, res) => clientController.delete(req, res));

// ─── Suppliers ────────────────────────────────────────────────────────────────
app.get(   '/api/suppliers',              authenticateToken, requirePermission('SUPPLIERS_VIEW'),   (req, res) => supplierController.getAll(req, res));
app.get(   '/api/suppliers/:id',          authenticateToken, requirePermission('SUPPLIERS_VIEW'),   (req, res) => supplierController.getById(req, res));
app.post(  '/api/suppliers',              authenticateToken, requirePermission('SUPPLIERS_CREATE'), (req, res) => supplierController.create(req, res));
app.patch( '/api/suppliers/:id',          authenticateToken, requirePermission('SUPPLIERS_UPDATE'), (req, res) => supplierController.update(req, res));
app.delete('/api/suppliers/:id',          authenticateToken, requirePermission('SUPPLIERS_DELETE'), (req, res) => supplierController.delete(req, res));
app.get(   '/api/suppliers/:id/balance',  authenticateToken, requirePermission('SUPPLIERS_VIEW'),   (req, res) => purchaseOrderController.getSupplierBalance(req, res));

// ─── Products ─────────────────────────────────────────────────────────────────
app.get(   '/api/products',     authenticateToken, requirePermission('PRODUCTS_VIEW'),   (req, res) => productController.getAll(req, res));
app.get(   '/api/products/:id', authenticateToken, requirePermission('PRODUCTS_VIEW'),   (req, res) => productController.getById(req, res));
app.post(  '/api/products',     authenticateToken, requirePermission('PRODUCTS_CREATE'), (req, res) => productController.create(req, res));
app.patch( '/api/products/:id', authenticateToken, requirePermission('PRODUCTS_UPDATE'), (req, res) => productController.update(req, res));
app.delete('/api/products/:id', authenticateToken, requirePermission('PRODUCTS_DELETE'), (req, res) => productController.delete(req, res));

// ─── Purchase Orders ──────────────────────────────────────────────────────────
app.get(   '/api/orders',                  authenticateToken, requirePermission('ORDERS_VIEW'),   (req, res) => purchaseOrderController.getAllOrders(req, res));
app.get(   '/api/orders/debt-summary',     authenticateToken, requirePermission('ORDERS_VIEW'),   (req, res) => purchaseOrderController.getDebtSummary(req, res));
app.post(  '/api/orders',                  authenticateToken, requirePermission('ORDERS_CREATE'), (req, res) => purchaseOrderController.createOrder(req, res));
app.patch( '/api/orders/:id/pay',          authenticateToken, requirePermission('ORDERS_UPDATE'), (req, res) => purchaseOrderController.recordPayment(req, res));
app.patch( '/api/orders/:id/status',       authenticateToken, requirePermission('ORDERS_UPDATE'), (req, res) => purchaseOrderController.updateOrderStatus(req, res));
app.patch( '/api/orders/:id/expenses',     authenticateToken, requirePermission('ORDERS_UPDATE'), (req, res) => purchaseOrderController.upsertExpenses(req, res));
app.patch( '/api/orders/:id',             authenticateToken, requirePermission('ORDERS_UPDATE'), (req, res) => purchaseOrderController.updateOrder(req, res));
app.delete('/api/orders/:id',             authenticateToken, requirePermission('ORDERS_DELETE'), (req, res) => purchaseOrderController.deleteOrder(req, res));

// ─── Income ───────────────────────────────────────────────────────────────────
app.get('/api/income', authenticateToken, requirePermission('INCOME_VIEW'), (req, res) => incomeController.getIncomeSummary(req, res));

// ─── Expense Formula Settings ─────────────────────────────────────────────────
app.get(   '/api/expense-formulas',     authenticateToken, requirePermission('SETTINGS_VIEW'),   (req, res) => expenseFormulaController.getAll(req, res));
app.post(  '/api/expense-formulas',     authenticateToken, requirePermission('SETTINGS_CREATE'), (req, res) => expenseFormulaController.create(req, res));
app.patch( '/api/expense-formulas/:id', authenticateToken, requirePermission('SETTINGS_UPDATE'), (req, res) => expenseFormulaController.update(req, res));
app.delete('/api/expense-formulas/:id', authenticateToken, requirePermission('SETTINGS_DELETE'), (req, res) => expenseFormulaController.delete(req, res));
app.patch( '/api/expense-formulas',     authenticateToken, requirePermission('SETTINGS_UPDATE'), (req, res) => expenseFormulaController.bulkUpdate(req, res));

// ─── Warehouse ────────────────────────────────────────────────────────────────
app.get(   '/api/warehouse/stock',            authenticateToken, requirePermission('WAREHOUSE_VIEW'),   (req, res) => warehouseController.getStock(req, res));
app.get(   '/api/warehouse/arrivals',         authenticateToken, requirePermission('WAREHOUSE_VIEW'),   (req, res) => warehouseController.getArrivals(req, res));
app.post(  '/api/warehouse/arrivals',         authenticateToken, requirePermission('WAREHOUSE_CREATE'), (req, res) => warehouseController.createArrival(req, res));
app.delete('/api/warehouse/arrivals/:id',     authenticateToken, requirePermission('WAREHOUSE_DELETE'), (req, res) => warehouseController.deleteArrival(req, res));
app.get(   '/api/warehouse/dispatches',       authenticateToken, requirePermission('WAREHOUSE_VIEW'),   (req, res) => warehouseController.getDispatches(req, res));
app.get(   '/api/warehouse/dispatches/:id',   authenticateToken, requirePermission('WAREHOUSE_VIEW'),   (req, res) => warehouseController.getDispatchById(req, res));
app.post(  '/api/warehouse/dispatches',       authenticateToken, requirePermission('WAREHOUSE_CREATE'), (req, res) => warehouseController.createDispatch(req, res));
app.delete('/api/warehouse/dispatches/:id',   authenticateToken, requirePermission('WAREHOUSE_DELETE'), (req, res) => warehouseController.deleteDispatch(req, res));

// ─── Loans ────────────────────────────────────────────────────────────────────
app.get( '/api/loans',                                  authenticateToken, requirePermission('LOANS_VIEW'),   (req, res) => loanController.getLoans(req, res));
app.get( '/api/loans/summary',                          authenticateToken, requirePermission('LOANS_VIEW'),   (req, res) => loanController.getSummary(req, res));
app.post('/api/loans/:id/pay-money',                    authenticateToken, requirePermission('LOANS_UPDATE'), (req, res) => loanController.payByMoney(req, res));
app.post('/api/loans/:id/pay-product',                  authenticateToken, requirePermission('LOANS_UPDATE'), (req, res) => loanController.payByProduct(req, res));
app.post('/api/loans/group/:groupId/pay-money',         authenticateToken, requirePermission('LOANS_UPDATE'), (req, res) => loanController.payGroupByMoney(req, res));
app.post('/api/loans/group/:groupId/pay-product',       authenticateToken, requirePermission('LOANS_UPDATE'), (req, res) => loanController.payGroupByProduct(req, res));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ERP Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
