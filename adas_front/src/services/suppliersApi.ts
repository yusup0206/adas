import type {
  SupplierResponse,
  SupplierFilters,
} from "@/interfaces/suppliers.interface";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<SupplierResponse, SupplierFilters | void>({
      query: (filters) => {
        let queryString = "/suppliers";
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
      providesTags: ["Supplier"],
    }),
    createSupplier: builder.mutation({
      query: (body) => ({
        url: `/suppliers`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Supplier"],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Supplier"],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier"],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
