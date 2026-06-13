# ADAS ERP — Project Description

> **Purpose of this file:** Give any AI assistant full context about this project so it can add features, fix bugs, or refactor code without needing to re-analyze from scratch.

---

## 1. Project Overview

**ADAS ERP** is a business management system built for a trading company. It tracks:
- Suppliers & purchase orders (with debt management)
- Clients & agreements
- Products & units of measurement
- Warehouse stock (import & export)
- Income reporting

The system is multilingual: **Turkmen (tk)**, **Russian (ru)**, and **English (en)**.

---

## 2. Tech Stack

### Backend (`adas_backend/`)
| Technology | Details |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | Prisma v5 |
| Database | MySQL |
| Validation | Zod |
| Architecture | Controller → Service → Prisma (Repository for simpler models) |

### Frontend (`adas_front/`)
| Technology | Details |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| UI Library | Ant Design v5 |
| State/API | Redux Toolkit + RTK Query |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| i18n | react-i18next |
| Icons | react-icons (fa6) |

---

## 3. Database Models (Prisma Schema)

### `Supplier`
Tracks companies that supply products. Maintains running totals:
- `totalAmount` — sum of all purchase orders
- `paidAmount` — amount paid so far
- `remainingDebt` — what is still owed

### `Product`
A product/item that can be ordered, stored in warehouses.
- Linked to `Measurement` (unit of measure)
- Has `productionCountry_tm` and `productionCountry_ru`

### `Measurement`
Units of measure (e.g. kg, pcs, litre).

### `PurchaseOrder`
An order placed to a supplier.
- Status: `PENDING` | `RECEIVED`
- Has many `PurchaseOrderItem`s
- Can be linked to an `Agreement`
- Creating an order increments the supplier's `totalAmount` & `remainingDebt`
- Paying an order increments `paidAmount` & decrements `remainingDebt`

### `PurchaseOrderItem`
A line item in a purchase order: product, quantity, unitPrice, totalPrice.

### `Client`
A company that buys from the business. Has full banking details (swift, accountNo, bankIdCode etc.).

### `Agreement`
A contract between two clients (buyer & seller). Can have purchase orders linked to it.

### `WarehouseArrival`
Records a product arriving **into** a warehouse.
- `warehouseType`: `IMPORT` or `EXPORT`
- **IMPORT arrivals** = products from purchase orders/suppliers arriving into the import warehouse
- **EXPORT arrivals** = products given by clients **instead of money** (barter/payment-in-kind) arriving into the export warehouse
- Linked to: `product`, `supplier` (optional), `purchaseOrder` (optional), `client` (optional)
- Has: `quantity`, `unitPrice`, `totalPrice`, `note`, `arrivalDate`

### `WarehouseDispatch`
Records a product leaving a warehouse going **to a client**.
- `warehouseType`: `IMPORT` or `EXPORT`
- Linked to: `product`, `client` (optional)
- Has: `quantity`, `note`, `dispatchDate`
- Backend validates sufficient stock before allowing dispatch

---

## 4. Business Logic

### Warehouse Logic (KEY CONCEPT)
The client has **2 warehouses**:

#### Import Warehouse (`IMPORT`)
- Products arrive here when purchase orders are placed/received from suppliers
- Arrivals are manually registered in the system (linked to a supplier/order)
- Products leave (dispatches) when they are sent to clients

#### Export Warehouse (`EXPORT`)
- Products arrive here when a **client pays with goods instead of money** (barter/payment-in-kind)
- These are client-provided goods that the company receives as payment
- Products leave (dispatches) when they are sent somewhere else

#### Stock Calculation
`currentStock = totalArrived - totalDispatched` (per product, per warehouse type)

Backend prevents dispatching more than current stock.

### Supplier Debt Tracking
- `PurchaseOrder` created → supplier `totalAmount` and `remainingDebt` increase
- Payment recorded → supplier `paidAmount` increases, `remainingDebt` decreases
- `PurchaseOrder` deleted → all supplier balances are reverted

### Order Status
- `PENDING` — order placed but not yet received
- `RECEIVED` — goods have been received. **When status changes to RECEIVED, the backend automatically creates `WarehouseArrival` records for every item in the order into the IMPORT warehouse.** This is done inside a Prisma transaction in `updateOrderStatus()`. It only fires once (checks `order.status !== 'RECEIVED'` before creating arrivals).

### Supplier Debt Tracking (lives in Orders, NOT Warehouse)
The payment/debt tracking belongs to the Orders module:
- Order view modal (`UpdateModal.tsx`) shows current debt and allows recording a payment
- Payment → `paidAmount` increases on both Order and Supplier, `remainingDebt` decreases on Supplier
- This is intentional: debt is created by orders, so it's paid from orders
- The warehouse only tracks physical goods, not money flow

---

## 5. API Endpoints

### Agreements
- `GET /api/agreements` — list all
- `GET /api/agreements/:id` — get one
- `POST /api/agreements` — create
- `PATCH /api/agreements/:id` — update
- `DELETE /api/agreements/:id` — delete

### Measurements (Units)
- `GET /api/measurements`
- `POST /api/measurements`
- `PATCH /api/measurements/:id`
- `DELETE /api/measurements/:id`

### Clients
- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `DELETE /api/clients/:id`

### Suppliers
- `GET /api/suppliers`
- `GET /api/suppliers/:id`
- `POST /api/suppliers`
- `PATCH /api/suppliers/:id`
- `DELETE /api/suppliers/:id`
- `GET /api/suppliers/:id/balance`

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Orders (Purchase Orders)
- `GET /api/orders?page=&pageSize=&status=`
- `POST /api/orders`
- `PATCH /api/orders/:id/pay` — record a payment
- `PATCH /api/orders/:id/status` — update PENDING/RECEIVED
- `PATCH /api/orders/:id` — general update
- `DELETE /api/orders/:id`

### Warehouse
- `GET /api/warehouse/stock?type=IMPORT|EXPORT` — current stock per product
- `GET /api/warehouse/arrivals?type=IMPORT|EXPORT&page=&pageSize=`
- `POST /api/warehouse/arrivals` — add arrival
- `DELETE /api/warehouse/arrivals/:id`
- `GET /api/warehouse/dispatches?type=IMPORT|EXPORT&page=&pageSize=`
- `POST /api/warehouse/dispatches` — dispatch product (validates stock)
- `DELETE /api/warehouse/dispatches/:id`

### Income
- `GET /api/income` — income summary with per-product breakdown

---

## 6. Frontend Structure

```
adas_front/src/
├── App.tsx               # Ant Design ConfigProvider, locale setup
├── store.ts              # Redux store with all RTK Query APIs
├── routes/Router.tsx     # React Router routes
├── layouts/Layout.tsx    # Sidebar + Outlet
├── pageData/sidebarData.tsx  # Sidebar navigation items
├── lang/
│   ├── en.json           # English translations
│   ├── ru.json           # Russian translations
│   └── tk.json           # Turkmen translations
├── interfaces/           # TypeScript interfaces per domain
├── services/             # RTK Query API slices
│   ├── clientsApi.ts
│   ├── suppliersApi.ts
│   ├── productsApi.ts
│   ├── ordersApi.ts
│   ├── agreementApi.ts
│   ├── unitsApi.ts
│   ├── incomeApi.ts
│   └── warehouseApi.ts   ← NEW
├── pages/
│   ├── Clients.tsx
│   ├── Suppliers.tsx
│   ├── Products.tsx
│   ├── Units.tsx
│   ├── Orders.tsx
│   ├── Agreements.tsx
│   ├── AgreementViewOne.tsx
│   ├── Income.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   └── Warehouses.tsx    ← NEW
└── components/
    ├── shared/
    │   ├── Box.tsx           # White card wrapper
    │   ├── Section.tsx       # Page section padding
    │   ├── DeleteModal.tsx   # Reusable delete confirmation modal
    │   ├── Sidebar.tsx       # Navigation sidebar
    │   └── header/Header.tsx
    ├── orders/
    │   ├── CreateModal.tsx
    │   ├── UpdateModal.tsx
    │   ├── EditModal.tsx
    │   └── UpdateStatusModal.tsx
    └── warehouse/            ← NEW
        ├── CreateArrivalModal.tsx  # Add arrivals to Import/Export warehouse
        └── CreateDispatchModal.tsx # Dispatch products to clients
```

---

## 7. Frontend Patterns

### Adding a new page
1. Create `src/pages/NewPage.tsx`
2. Create `src/services/newApi.ts` (RTK Query `createApi`)
3. Create `src/interfaces/new.interface.ts`
4. Register API in `src/store.ts` (reducer + middleware)
5. Add route in `src/routes/Router.tsx`
6. Add sidebar item in `src/pageData/sidebarData.tsx`
7. Add translation keys to all 3 language files (`en.json`, `ru.json`, `tk.json`)

### RTK Query pattern
```ts
export const myApi = createApi({
  reducerPath: 'myApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_APP_BASE_URL }),
  tagTypes: ['MyEntity'],
  endpoints: (builder) => ({
    getAll: builder.query<Response, Filters | void>({ query: ... providesTags: ['MyEntity'] }),
    create: builder.mutation<Entity, Values>({ query: (body) => ({ url: '/...', method: 'POST', body }), invalidatesTags: ['MyEntity'] }),
  }),
});
```

### Component pattern
- Use Ant Design `Modal`, `Form`, `Table`, `Button`, `Select`, `InputNumber`
- Use `App.useApp()` for `message` notifications
- Use `useTranslation()` hook for all text — always use `t("key")`
- Language-conditional names: `i18n.language === 'ru' ? item.name_ru : item.name_tm`
- Shared layout: wrap page in `<Header title={...} />` + `<Section><Box>...</Box></Section>`

### Backend patterns
- **Controller** — handles HTTP req/res, validation with Zod
- **Service** — business logic, transactions, aggregations
- **Repository** — simple Prisma CRUD (for simpler models)
- Register new routes in `src/index.ts`
- Use `prisma.$transaction()` for operations that affect multiple tables

---

## 8. Environment Variables

### Backend (`.env`)
```
DATABASE_URL="mysql://user:password@localhost:3306/adas"
PORT=5000
```

### Frontend (`.env`)
```
VITE_APP_BASE_URL=http://localhost:5000/api
```

---

## 9. Running the Project

```bash
# Backend
cd adas_backend
npm run dev          # nodemon + ts-node on port 5000

# Frontend
cd adas_front
npm run dev          # Vite dev server

# Apply schema changes (non-interactive)
cd adas_backend
npx prisma db push
```

---

## 10. Known Decisions & Notes

- **`migrate dev` does not work** in non-interactive terminals — always use `npx prisma db push` for schema changes in this setup
- `sellPrice`, `buyPrice`, and `sku` fields were removed from `Product` in a previous refactor — do NOT re-add them
- The `income` page currently shows purchase cost breakdown; `sellPrice` is 0 since it was removed
- Authentication is handled via a simple login page — check `Login.tsx` for implementation details
- The sidebar uses `sidebarData.tsx` — any new page needs an entry there with `labelKey`, `url`, and `icon` (from `react-icons/fa6`)
- All table text that can be in TM or RU uses both `name_tm` and `name_ru` fields — always create both when adding bilingual data
- **`WarehouseType` is NOT imported from `@prisma/client`** — it is defined locally as `type WarehouseType = 'IMPORT' | 'EXPORT'` in both `warehouse.service.ts` and `warehouse.controller.ts`. This is because older ts-node + Prisma v5 setups sometimes don't expose enums from the client package correctly
- **Auto-arrival**: When an order status changes to `RECEIVED`, `purchaseOrder.service.ts → updateOrderStatus()` automatically creates `WarehouseArrival` entries for all order items in the IMPORT warehouse. This runs in a single Prisma transaction. It only triggers once (guard: `order.status !== 'RECEIVED'`)
- **Supplier debt stays in Orders** — the debt/payment UI is in the order view modal (`UpdateModal.tsx`), not in the warehouse. Warehouse only tracks physical goods. Do NOT move payment logic to warehouse
- **Duplicate arrival prevention**: Changing order status from RECEIVED back to PENDING does NOT delete the warehouse arrivals. If you need to support reverting status, you must also clean up warehouse arrivals manually

