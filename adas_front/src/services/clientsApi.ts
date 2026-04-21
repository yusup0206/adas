import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ClientFilters,
  ClientResponse,
} from "@/interfaces/clients.interface";

export const clientsApi = createApi({
  reducerPath: "clientsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Client"],
  endpoints: (builder) => ({
    getClients: builder.query<ClientResponse, ClientFilters | void>({
      query: (filters) => {
        let queryString = "/clients";
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
      providesTags: ["Client"],
    }),
    createClient: builder.mutation({
      query: (body) => ({
        url: `/clients`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Client"],
    }),
    updateClient: builder.mutation({
      query: ({ id, body }) => ({
        url: `/clients/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Client"],
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Client"],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApi;
