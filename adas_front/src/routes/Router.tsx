import Layout from "@/layouts/Layout";
import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import RequirePermission from "@/components/RequirePermission";
import Login from "@/pages/Login";

// pages
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

function Router() {
  const routes = useRoutes([
    { path: "/", element: <Navigate to="/income" replace /> },

    { path: "/login", element: <Login /> },

    {
      path: "/",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        { path: "clients", element: <RequirePermission permission="MANAGE_CLIENTS" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Clients /></RequirePermission> },
        { path: "units", element: <RequirePermission permission="MANAGE_PRODUCTS" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Units /></RequirePermission> },
        { path: "products", element: <RequirePermission permission="MANAGE_PRODUCTS" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Products /></RequirePermission> },
        { path: "orders", element: <RequirePermission permission="MANAGE_ORDERS" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Orders /></RequirePermission> },
        { path: "suppliers", element: <RequirePermission permission="MANAGE_SUPPLIERS" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Suppliers /></RequirePermission> },
        { path: "income", element: <RequirePermission permission="VIEW_INCOME" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Income /></RequirePermission> },
        { path: "warehouses", element: <RequirePermission permission="MANAGE_WAREHOUSE" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Warehouses /></RequirePermission> },
        { path: "debt", element: <RequirePermission permission={["MANAGE_WAREHOUSE", "VIEW_INCOME"]} fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Debt /></RequirePermission> },
        { path: "users", element: <RequirePermission permission="MANAGE_USERS" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Users /></RequirePermission> },
        { path: "roles", element: <RequirePermission permission="MANAGE_ROLES" fallback={<div className="p-8 text-center text-red-500 font-bold">Access Denied</div>}><Roles /></RequirePermission> },
      ],
    },

    { path: "*", element: <Navigate to="/clients" replace /> },
  ]);

  return routes;
}

export default Router;
