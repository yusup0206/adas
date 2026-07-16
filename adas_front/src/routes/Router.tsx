import Layout from "@/layouts/Layout";
import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import ProtectedRoute from "@/components/ProtectedRoute";
import RequirePermission from "@/components/RequirePermission";
import Loader from "@/components/shared/Loader";

// pages
const Login = lazy(() => import("@/pages/Login"));
const Clients = lazy(() => import("@/pages/Clients"));
const Units = lazy(() => import("@/pages/Units"));
const Products = lazy(() => import("@/pages/Products"));
const Orders = lazy(() => import("@/pages/Orders"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const Income = lazy(() => import("@/pages/Income"));
const Warehouses = lazy(() => import("@/pages/Warehouses"));
const Debt = lazy(() => import("@/pages/Debt"));
const Users = lazy(() => import("@/pages/Users"));
const Roles = lazy(() => import("@/pages/Roles"));
const DispatchWaybill = lazy(() => import("@/pages/DispatchWaybill"));
const ExpenseFormulas = lazy(() => import("@/pages/ExpenseFormulas"));

const RootRedirect = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user || !user.permissions) return <Navigate to="/login" replace />;

  if (user.permissions.includes("INCOME_VIEW")) return <Navigate to="/income" replace />;
  if (user.permissions.includes("ORDERS_VIEW")) return <Navigate to="/orders" replace />;
  if (user.permissions.includes("WAREHOUSE_VIEW")) return <Navigate to="/warehouses" replace />;
  if (user.permissions.includes("USERS_VIEW")) return <Navigate to="/users" replace />;
  if (user.permissions.includes("ROLES_VIEW")) return <Navigate to="/roles" replace />;
  if (user.permissions.includes("PRODUCTS_VIEW")) return <Navigate to="/products" replace />;
  if (user.permissions.includes("UNITS_VIEW")) return <Navigate to="/units" replace />;
  if (user.permissions.includes("CLIENTS_VIEW")) return <Navigate to="/clients" replace />;
  if (user.permissions.includes("SUPPLIERS_VIEW")) return <Navigate to="/suppliers" replace />;
  if (user.permissions.includes("SETTINGS_VIEW")) return <Navigate to="/expense-formulas" replace />;

  return <Navigate to="/login" replace />;
};

function Router() {
  const routes = useRoutes([
    { path: "/", element: <RootRedirect /> },

    { path: "/login", element: <Login /> },

    {
      path: "/",
      element: (
        <Suspense fallback={<Loader />}>
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        {
          path: "clients",
          element: (
            <RequirePermission
              permission="CLIENTS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Clients />
            </RequirePermission>
          ),
        },
        {
          path: "units",
          element: (
            <RequirePermission
              permission="UNITS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Units />
            </RequirePermission>
          ),
        },
        {
          path: "products",
          element: (
            <RequirePermission
              permission="PRODUCTS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Products />
            </RequirePermission>
          ),
        },
        {
          path: "orders",
          element: (
            <RequirePermission
              permission="ORDERS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Orders />
            </RequirePermission>
          ),
        },
        {
          path: "suppliers",
          element: (
            <RequirePermission
              permission="SUPPLIERS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Suppliers />
            </RequirePermission>
          ),
        },
        {
          path: "income",
          element: (
            <RequirePermission
              permission="INCOME_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Income />
            </RequirePermission>
          ),
        },
        {
          path: "warehouses",
          element: (
            <RequirePermission
              permission="WAREHOUSE_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Warehouses />
            </RequirePermission>
          ),
        },
        {
          path: "debt",
          element: (
            <RequirePermission
              permission={["INCOME_VIEW", "WAREHOUSE_VIEW"]}
              fallback={<Navigate to="/" />}
            >
              <Debt />
            </RequirePermission>
          ),
        },
        {
          path: "users",
          element: (
            <RequirePermission
              permission="USERS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Users />
            </RequirePermission>
          ),
        },
        {
          path: "roles",
          element: (
            <RequirePermission
              permission="ROLES_VIEW"
              fallback={<Navigate to="/" />}
            >
              <Roles />
            </RequirePermission>
          ),
        },
        {
          path: "dispatch-waybill/:id",
          element: (
            <RequirePermission
              permission="WAREHOUSE_VIEW"
              fallback={<Navigate to="/" />}
            >
              <DispatchWaybill />
            </RequirePermission>
          ),
        },
        {
          path: "expense-formulas",
          element: (
            <RequirePermission
              permission="SETTINGS_VIEW"
              fallback={<Navigate to="/" />}
            >
              <ExpenseFormulas />
            </RequirePermission>
          ),
        },
      ],
    },

    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return routes;
}

export default Router;
