import type { IncomeSummary } from "@/interfaces/income.interface";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const incomeApi = createApi({
  reducerPath: "incomeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  }),
  tagTypes: ["Income"],
  endpoints: (builder) => ({
    getIncomeSummary: builder.query<IncomeSummary, void>({
      query: () => "/income",
      providesTags: ["Income"],
    }),
  }),
});

export const { useGetIncomeSummaryQuery } = incomeApi;
