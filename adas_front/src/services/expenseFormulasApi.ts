import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export interface ExpenseFormula {
  id: number;
  key: string;
  name: string;
  formula: string;
}

export const expenseFormulasApi = createApi({
  reducerPath: "expenseFormulasApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ExpenseFormulas"],
  endpoints: (builder) => ({
    getFormulas: builder.query<{ data: ExpenseFormula[] }, void>({
      query: () => "/expense-formulas",
      providesTags: ["ExpenseFormulas"],
    }),
    createFormula: builder.mutation<
      { data: ExpenseFormula },
      { name: string; formula: string }
    >({
      query: (body) => ({
        url: "/expense-formulas",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExpenseFormulas"],
    }),
    updateFormula: builder.mutation<
      { data: ExpenseFormula },
      { id: number; name?: string; formula?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/expense-formulas/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ExpenseFormulas"],
    }),
    deleteFormula: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/expense-formulas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExpenseFormulas"],
    }),
    updateFormulas: builder.mutation<
      { data: ExpenseFormula[] },
      { formulas: { key: string; name?: string; formula: string }[] }
    >({
      query: (body) => ({
        url: "/expense-formulas",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ExpenseFormulas"],
    }),
  }),
});

export const {
  useGetFormulasQuery,
  useCreateFormulaMutation,
  useUpdateFormulaMutation,
  useDeleteFormulaMutation,
  useUpdateFormulasMutation,
} = expenseFormulasApi;
