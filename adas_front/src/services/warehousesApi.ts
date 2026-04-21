import type {
  WarehouseResponse,
  WarehouseFilters,
} from "@/interfaces/warehouses.interface";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const warehousesApi = createApi({
  reducerPath: "warehousesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Warehouse"],
  endpoints: (builder) => ({
    getWarehouses: builder.query<WarehouseResponse, WarehouseFilters | void>({
      query: (filters) => {
        let queryString = "/warehouses";
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
      providesTags: ["Warehouse"],
    }),
    createWarehouse: builder.mutation({
      query: (body) => ({
        url: `/warehouses`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    updateWarehouse: builder.mutation({
      query: ({ id, body }) => ({
        url: `/warehouses/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteWarehouse: builder.mutation({
      query: (id) => ({
        url: `/warehouses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehousesApi;
