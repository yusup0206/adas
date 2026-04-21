# ERP System Technical Specification

## 1. Overview
A robust ERP backend designed to handle bilingual inventory (Turkmen/Russian) and complex supplier debt management with automated installment generation.

## 2. Tech Stack
- **Runtime**: Node.js (ESNext)
- **Framework**: Express with TypeScript
- **ORM**: Prisma
- **Database**: MySQL
- **Validation**: Zod
- **Architecture**: Controller-Service-Repository

## 3. Database Schema Design (Prisma)
### 3.1. Bilingual Support
Models (`Supplier`, `Product`, `Warehouse`) include `name_tm` and `name_ru` fields. These should be displayed based on the user's preferred language on the frontend.

### 3.2. Supplier Debt Management
- **Supplier**: Tracks `totalAmount`, `paidAmount`, and `remainingDebt`.
- **PurchaseOrder**: Defined as either `CASH` or `INSTALLMENT`.
- **PaymentPlan**: Link between a PurchaseOrder and its Installments.
- **Installment**: Individual payments with due dates and statuses (`PENDING`, `PAID`, `OVERDUE`).

## 4. Business Logic
### 4.1. Purchase Order Creation
1. Validate incoming request using Zod.
2. If `type` is `INSTALLMENT`:
   - Create a `PaymentPlan`.
   - Automatically generate `N` installments (usually 3 or 6 months).
   - Divide `totalPrice` by `N` to get the installment amount.
3. Use Prisma Transactions to:
   - Create the `PurchaseOrder`.
   - Update the `Supplier`'s `totalAmount` and `remainingDebt`.

### 4.2. Payment Processing
1. Mark `Installment` as `PAID`.
2. Update the `Supplier`'s `paidAmount` and `remainingDebt`.
3. Use a transaction to ensure both updates succeed or fail together.

## 5. Precision & Currency
- Use `Decimal(15, 2)` for all monetary fields in MySQL.
- Avoid floating-point arithmetic in JavaScript; use `prisma.Decimal` (via `decimal.js`) for calculations.

## 6. API Endpoints (Planned)
- `POST /orders`: Create a new purchase order.
- `GET /suppliers/:id/balance`: Get current debt status for a supplier.
- `PATCH /installments/:id/pay`: Record a payment for an installment.
