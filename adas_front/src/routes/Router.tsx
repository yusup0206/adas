import Layout from "@/layouts/Layout";
import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
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

const Home = lazy(() => import("@/pages/Home"));

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
        { path: "clients", element: <Clients /> },
        { path: "units", element: <Units /> },
        { path: "products", element: <Products /> },
        { path: "orders", element: <Orders /> },
        { path: "suppliers", element: <Suppliers /> },
        { path: "income", element: <Income /> },
        { path: "warehouses", element: <Warehouses /> },
        { path: "debt", element: <Debt /> },

        { path: "home", element: <Home /> },
      ],
    },

    { path: "*", element: <Navigate to="/clients" replace /> },
  ]);

  return routes;
}

export default Router;
