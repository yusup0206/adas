import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { purchaseOrderController } from './controllers/purchaseOrder.controller';
import { supplierController } from './controllers/supplier.controller';
import { warehouseController } from './controllers/warehouse.controller';
import { productController } from './controllers/product.controller';
import { clientController } from './controllers/client.controller';
import { measurementController } from './controllers/measurement.controller';
import { agreementController } from './controllers/agreement.controller';
import { incomeController } from './controllers/income.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('Registering routes...');

// Routes
app.get('/api/agreements', (req, res) => agreementController.getAll(req, res));
app.get('/api/agreements/:id', (req, res) => agreementController.getById(req, res));
app.post('/api/agreements', (req, res) => agreementController.create(req, res));
app.patch('/api/agreements/:id', (req, res) => agreementController.update(req, res));
app.delete('/api/agreements/:id', (req, res) => agreementController.delete(req, res));

app.get('/api/measurements', (req, res) => measurementController.getAll(req, res));
app.post('/api/measurements', (req, res) => measurementController.create(req, res));
app.patch('/api/measurements/:id', (req, res) => measurementController.update(req, res));
app.delete('/api/measurements/:id', (req, res) => measurementController.delete(req, res));

app.get('/api/clients', (req, res) => clientController.getAll(req, res));
app.post('/api/clients', (req, res) => clientController.create(req, res));
app.patch('/api/clients/:id', (req, res) => clientController.update(req, res));
app.delete('/api/clients/:id', (req, res) => clientController.delete(req, res));

app.get('/api/suppliers', (req, res) => supplierController.getAll(req, res));
app.get('/api/suppliers/:id', (req, res) => supplierController.getById(req, res));
app.post('/api/suppliers', (req, res) => supplierController.create(req, res));
app.patch('/api/suppliers/:id', (req, res) => supplierController.update(req, res));
app.delete('/api/suppliers/:id', (req, res) => supplierController.delete(req, res));

app.get('/api/warehouses', (req, res) => warehouseController.getAll(req, res));
app.get('/api/warehouses/:id', (req, res) => warehouseController.getById(req, res));
app.post('/api/warehouses', (req, res) => warehouseController.create(req, res));
app.patch('/api/warehouses/:id', (req, res) => warehouseController.update(req, res));
app.delete('/api/warehouses/:id', (req, res) => warehouseController.delete(req, res));

app.get('/api/products', (req, res) => productController.getAll(req, res));
app.get('/api/products/:id', (req, res) => productController.getById(req, res));
app.post('/api/products', (req, res) => productController.create(req, res));
app.patch('/api/products/:id', (req, res) => productController.update(req, res));
app.delete('/api/products/:id', (req, res) => productController.delete(req, res));

app.get('/api/orders', (req, res) => purchaseOrderController.getAllOrders(req, res));
app.post('/api/orders', (req, res) => purchaseOrderController.createOrder(req, res));
app.patch('/api/installments/:id/pay', (req, res) => purchaseOrderController.recordPayment(req, res));
app.get('/api/suppliers/:id/balance', (req, res) => purchaseOrderController.getSupplierBalance(req, res));

app.get('/api/income', (req, res) => incomeController.getIncomeSummary(req, res));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ERP Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
