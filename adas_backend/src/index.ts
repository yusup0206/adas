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
import { authenticateToken } from './middlewares/auth.middleware';
import { requirePermission } from './middlewares/permission.middleware';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('Registering routes...');

// Routes

// Auth routes
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/refresh', (req, res) => authController.refreshToken(req, res));
app.post('/api/auth/logout', (req, res) => authController.logout(req, res));

// User & Role routes
app.get('/api/users', authenticateToken, requirePermission('MANAGE_USERS'), (req, res) => userController.getAll(req, res));
app.get('/api/users/:id', authenticateToken, requirePermission('MANAGE_USERS'), (req, res) => userController.getById(req, res));
app.post('/api/users', authenticateToken, requirePermission('MANAGE_USERS'), (req, res) => userController.create(req, res));
app.patch('/api/users/:id', authenticateToken, requirePermission('MANAGE_USERS'), (req, res) => userController.update(req, res));
app.delete('/api/users/:id', authenticateToken, requirePermission('MANAGE_USERS'), (req, res) => userController.delete(req, res));

app.get('/api/roles', authenticateToken, requirePermission('MANAGE_ROLES'), (req, res) => roleController.getAll(req, res));
app.post('/api/roles', authenticateToken, requirePermission('MANAGE_ROLES'), (req, res) => roleController.create(req, res));
app.patch('/api/roles/:id', authenticateToken, requirePermission('MANAGE_ROLES'), (req, res) => roleController.update(req, res));
app.delete('/api/roles/:id', authenticateToken, requirePermission('MANAGE_ROLES'), (req, res) => roleController.delete(req, res));

app.get('/api/permissions', authenticateToken, requirePermission('MANAGE_ROLES'), (req, res) => permissionController.getAll(req, res));


app.get('/api/measurements', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => measurementController.getAll(req, res));
app.post('/api/measurements', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => measurementController.create(req, res));
app.patch('/api/measurements/:id', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => measurementController.update(req, res));
app.delete('/api/measurements/:id', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => measurementController.delete(req, res));

app.get('/api/clients', authenticateToken, requirePermission('MANAGE_CLIENTS'), (req, res) => clientController.getAll(req, res));
app.post('/api/clients', authenticateToken, requirePermission('MANAGE_CLIENTS'), (req, res) => clientController.create(req, res));
app.patch('/api/clients/:id', authenticateToken, requirePermission('MANAGE_CLIENTS'), (req, res) => clientController.update(req, res));
app.delete('/api/clients/:id', authenticateToken, requirePermission('MANAGE_CLIENTS'), (req, res) => clientController.delete(req, res));

app.get('/api/suppliers', authenticateToken, requirePermission('MANAGE_SUPPLIERS'), (req, res) => supplierController.getAll(req, res));
app.get('/api/suppliers/:id', authenticateToken, requirePermission('MANAGE_SUPPLIERS'), (req, res) => supplierController.getById(req, res));
app.post('/api/suppliers', authenticateToken, requirePermission('MANAGE_SUPPLIERS'), (req, res) => supplierController.create(req, res));
app.patch('/api/suppliers/:id', authenticateToken, requirePermission('MANAGE_SUPPLIERS'), (req, res) => supplierController.update(req, res));
app.delete('/api/suppliers/:id', authenticateToken, requirePermission('MANAGE_SUPPLIERS'), (req, res) => supplierController.delete(req, res));

app.get('/api/products', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => productController.getAll(req, res));
app.get('/api/products/:id', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => productController.getById(req, res));
app.post('/api/products', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => productController.create(req, res));
app.patch('/api/products/:id', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => productController.update(req, res));
app.delete('/api/products/:id', authenticateToken, requirePermission('MANAGE_PRODUCTS'), (req, res) => productController.delete(req, res));

app.get('/api/orders', authenticateToken, requirePermission('MANAGE_ORDERS'), (req, res) => purchaseOrderController.getAllOrders(req, res));
app.get('/api/orders/debt-summary', authenticateToken, requirePermission('VIEW_INCOME'), (req, res) => purchaseOrderController.getDebtSummary(req, res));
app.post('/api/orders', authenticateToken, requirePermission('MANAGE_ORDERS'), (req, res) => purchaseOrderController.createOrder(req, res));
app.patch('/api/orders/:id/pay', authenticateToken, requirePermission('MANAGE_ORDERS'), (req, res) => purchaseOrderController.recordPayment(req, res));
app.patch('/api/orders/:id/status', authenticateToken, requirePermission('MANAGE_ORDERS'), (req, res) => purchaseOrderController.updateOrderStatus(req, res));
app.patch('/api/orders/:id', authenticateToken, requirePermission('MANAGE_ORDERS'), (req, res) => purchaseOrderController.updateOrder(req, res));
app.delete('/api/orders/:id', authenticateToken, requirePermission('MANAGE_ORDERS'), (req, res) => purchaseOrderController.deleteOrder(req, res));
app.get('/api/suppliers/:id/balance', authenticateToken, requirePermission('MANAGE_SUPPLIERS'), (req, res) => purchaseOrderController.getSupplierBalance(req, res));

app.get('/api/income', authenticateToken, requirePermission('VIEW_INCOME'), (req, res) => incomeController.getIncomeSummary(req, res));

// Warehouse routes
app.get('/api/warehouse/stock', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.getStock(req, res));
app.get('/api/warehouse/arrivals', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.getArrivals(req, res));
app.post('/api/warehouse/arrivals', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.createArrival(req, res));
app.delete('/api/warehouse/arrivals/:id', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.deleteArrival(req, res));
app.get('/api/warehouse/dispatches', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.getDispatches(req, res));
app.post('/api/warehouse/dispatches', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.createDispatch(req, res));
app.delete('/api/warehouse/dispatches/:id', authenticateToken, requirePermission('MANAGE_WAREHOUSE'), (req, res) => warehouseController.deleteDispatch(req, res));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ERP Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
