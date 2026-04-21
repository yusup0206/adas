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
    recordPayment: builder.mutation<any, number>({
      query: (installmentId) => ({
        url: `/installments/${installmentId}/pay`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order", "Supplier"],
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
  useGetSupplierBalanceQuery,
} = ordersApi;
