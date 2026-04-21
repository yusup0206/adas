import { configureStore } from "@reduxjs/toolkit";

import { clientsApi } from "./services/clientsApi";
import { unitsApi } from "./services/unitsApi";
import { productsApi } from "./services/productsApi";
import { ordersApi } from "./services/ordersApi";
import { agreementApi } from "./services/agreementApi";
import { suppliersApi } from "./services/suppliersApi";
import { warehousesApi } from "./services/warehousesApi";
import { incomeApi } from "./services/incomeApi";

export const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
    [unitsApi.reducerPath]: unitsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [agreementApi.reducerPath]: agreementApi.reducer,
    [suppliersApi.reducerPath]: suppliersApi.reducer,
    [warehousesApi.reducerPath]: warehousesApi.reducer,
    [incomeApi.reducerPath]: incomeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      clientsApi.middleware,
      unitsApi.middleware,
      productsApi.middleware,
      ordersApi.middleware,
      agreementApi.middleware,
      suppliersApi.middleware,
      warehousesApi.middleware,
      incomeApi.middleware,
    ),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

