import type { IncomeSummary } from "@/interfaces/income.interface";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const incomeApi = createApi({
  reducerPath: "incomeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Income"],
  endpoints: (builder) => ({
    getIncomeSummary: builder.query<IncomeSummary, void>({
      query: () => "/income",
      providesTags: ["Income"],
    }),
  }),
});

export const { useGetIncomeSummaryQuery } = incomeApi;
