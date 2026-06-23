import { Request, Response } from 'express';
export declare class PurchaseOrderController {
    createOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    recordPayment(req: Request, res: Response): Promise<void>;
    updateOrderStatus(req: Request, res: Response): Promise<void>;
    deleteOrder(req: Request, res: Response): Promise<void>;
    updateOrder(req: Request, res: Response): Promise<void>;
    getSupplierBalance(req: Request, res: Response): Promise<void>;
    getAllOrders(req: Request, res: Response): Promise<void>;
    getDebtSummary(req: Request, res: Response): Promise<void>;
}
export declare const purchaseOrderController: PurchaseOrderController;
