import Layout from "@/layouts/Layout";
import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";

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

function Router() {
  const routes = useRoutes([
    { path: "/", element: <Navigate to="/income" replace /> },

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
              permission="MANAGE_CLIENTS"
              fallback={<Navigate to="/login" />}
            >
              <Clients />
            </RequirePermission>
          ),
        },
        {
          path: "units",
          element: (
            <RequirePermission
              permission="MANAGE_PRODUCTS"
              fallback={<Navigate to="/login" />}
            >
              <Units />
            </RequirePermission>
          ),
        },
        {
          path: "products",
          element: (
            <RequirePermission
              permission="MANAGE_PRODUCTS"
              fallback={<Navigate to="/login" />}
            >
              <Products />
            </RequirePermission>
          ),
        },
        {
          path: "orders",
          element: (
            <RequirePermission
              permission="MANAGE_ORDERS"
              fallback={<Navigate to="/login" />}
            >
              <Orders />
            </RequirePermission>
          ),
        },
        {
          path: "suppliers",
          element: (
            <RequirePermission
              permission="MANAGE_SUPPLIERS"
              fallback={<Navigate to="/login" />}
            >
              <Suppliers />
            </RequirePermission>
          ),
        },
        {
          path: "income",
          element: (
            <RequirePermission
              permission="VIEW_INCOME"
              fallback={<Navigate to="/login" />}
            >
              <Income />
            </RequirePermission>
          ),
        },
        {
          path: "warehouses",
          element: (
            <RequirePermission
              permission="MANAGE_WAREHOUSE"
              fallback={<Navigate to="/login" />}
            >
              <Warehouses />
            </RequirePermission>
          ),
        },
        {
          path: "debt",
          element: (
            <RequirePermission
              permission={["MANAGE_WAREHOUSE", "VIEW_INCOME"]}
              fallback={<Navigate to="/login" />}
            >
              <Debt />
            </RequirePermission>
          ),
        },
        {
          path: "users",
          element: (
            <RequirePermission
              permission="MANAGE_USERS"
              fallback={<Navigate to="/login" />}
            >
              <Users />
            </RequirePermission>
          ),
        },
        {
          path: "roles",
          element: (
            <RequirePermission
              permission="MANAGE_ROLES"
              fallback={<Navigate to="/login" />}
            >
              <Roles />
            </RequirePermission>
          ),
        },
        {
          path: "dispatch-waybill/:id",
          element: (
            <RequirePermission
              permission="MANAGE_WAREHOUSE"
              fallback={<Navigate to="/login" />}
            >
              <DispatchWaybill />
            </RequirePermission>
          ),
        },
      ],
    },

    { path: "*", element: <Navigate to="/income" replace /> },
  ]);

  return routes;
}

export default Router;
