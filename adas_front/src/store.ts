import { configureStore } from "@reduxjs/toolkit";

import { clientsApi } from "./services/clientsApi";
import { unitsApi } from "./services/unitsApi";
import { productsApi } from "./services/productsApi";
import { ordersApi } from "./services/ordersApi";
import { suppliersApi } from "./services/suppliersApi";
import { incomeApi } from "./services/incomeApi";
import { warehouseApi } from "./services/warehouseApi";
import { authApi } from "./services/authApi";
import { usersApi } from "./services/usersApi";
import { rolesApi } from "./services/rolesApi";
import { permissionsApi } from "./services/permissionsApi";
import { loansApi } from "./services/loansApi";
import authReducer from "./store/slices/authSlice";

export const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
    [unitsApi.reducerPath]: unitsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [suppliersApi.reducerPath]: suppliersApi.reducer,
    [incomeApi.reducerPath]: incomeApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [loansApi.reducerPath]: loansApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      clientsApi.middleware,
      unitsApi.middleware,
      productsApi.middleware,
      ordersApi.middleware,
      suppliersApi.middleware,
      incomeApi.middleware,
      warehouseApi.middleware,
      authApi.middleware,
      usersApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      loansApi.middleware,
    ),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
