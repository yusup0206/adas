import type {
  Order,
  OrderValues,
  OrderResponse,
  OrderFilters,
} from "@/interfaces/orders.interface";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Order", "Supplier"],
  endpoints: (builder) => ({
    getOrders: builder.query<OrderResponse, OrderFilters | void>({
      query: (filters) => {
        let queryString = "/orders";
        if (filters) {
          const params = new URLSearchParams();
          if (filters.search) params.append("search", filters.search);
          if (filters.page) params.append("page", filters.page.toString());
          if (filters.pageSize)
            params.append("pageSize", filters.pageSize.toString());
          if (filters.status) params.append("status", filters.status);

          if (params.toString()) queryString += `?${params.toString()}`;
        }
        return queryString;
      },
      providesTags: ["Order"],
    }),
    createOrder: builder.mutation<Order, OrderValues>({
      query: (body) => ({
        url: `/orders`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
    recordPayment: builder.mutation<any, { orderId: number; amount: number }>({
      query: ({ orderId, amount }) => ({
        url: `/orders/${orderId}/pay`,
        method: "PATCH",
        body: { amount },
      }),
      invalidatesTags: ["Order", "Supplier"],
    }),
    updateOrderStatus: builder.mutation<any, { orderId: number; status: string }>({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
    deleteOrder: builder.mutation<any, number>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order", "Supplier"],
    }),
    updateOrder: builder.mutation<any, { id: number; body: Partial<OrderValues> }>({
      query: ({ id, body }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
    getSupplierBalance: builder.query<any, number>({
      query: (supplierId) => `/suppliers/${supplierId}/balance`,
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useRecordPaymentMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
  useGetSupplierBalanceQuery,
} = ordersApi;
