import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  UnitFilters,
  UnitResponse,
} from "@/interfaces/units.interface";

export const unitsApi = createApi({
  reducerPath: "unitsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Unit"],
  endpoints: (builder) => ({
    getUnits: builder.query<UnitResponse, UnitFilters | void>({
      query: (filters) => {
        let queryString = "/measurements";
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
      providesTags: ["Unit"],
    }),
    createUnit: builder.mutation({
      query: (body) => ({
        url: `/measurements`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Unit"],
    }),
    updateUnit: builder.mutation({
      query: ({ id, body }) => ({
        url: `/measurements/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Unit"],
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `/measurements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Unit"],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitsApi;
