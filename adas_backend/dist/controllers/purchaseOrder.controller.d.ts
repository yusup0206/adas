import { Request, Response } from 'express';
export declare class PurchaseOrderController {
    createOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    recordPayment(req: Request, res: Response): Promise<void>;
    getSupplierBalance(req: Request, res: Response): Promise<void>;
}
export declare const purchaseOrderController: PurchaseOrderController;
