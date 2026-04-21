import type {
  Agreement,
  AgreementFilters,
  AgreementResponse,
  AgreementValues,
} from "@/interfaces/agreement.interface";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const agreementApi = createApi({
  reducerPath: "agreementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Agreement"],
  endpoints: (builder) => ({
    getAgreements: builder.query<AgreementResponse, AgreementFilters | void>({
      query: (filters) => {
        let queryString = "/agreements";
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
      providesTags: ["Agreement"],
    }),
    getAgreement: builder.query<Agreement, number>({
      query: (id) => `/agreements/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Agreement", id }],
    }),
    createAgreement: builder.mutation<Agreement, AgreementValues>({
      query: (body) => ({
        url: "/agreements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Agreement"],
    }),
    updateAgreement: builder.mutation<
      Agreement,
      { id: number; body: Partial<AgreementValues> }
    >({
      query: ({ id, body }) => ({
        url: `/agreements/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Agreement",
        { type: "Agreement", id },
      ],
    }),
  }),
});

export const {
  useGetAgreementsQuery,
  useGetAgreementQuery,
  useCreateAgreementMutation,
  useUpdateAgreementMutation,
} = agreementApi;
