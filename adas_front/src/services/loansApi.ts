import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import type { Loan, LoanSummary, LoanGroupResponse, LoanType } from '@/interfaces/loans.interface';

export const loansApi = createApi({
  reducerPath: 'loansApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Loan'],
  endpoints: (builder) => ({
    getLoans: builder.query<LoanGroupResponse, { type: LoanType; page?: number; pageSize?: number; status?: string; dateFrom?: string; dateTo?: string }>({
      query: ({ type, page, pageSize, status, dateFrom, dateTo }) => {
        const params = new URLSearchParams({ type });
        if (page) params.append('page', String(page));
        if (pageSize) params.append('pageSize', String(pageSize));
        if (status) params.append('status', status);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        return `/loans?${params.toString()}`;
      },
      providesTags: ['Loan'],
    }),
    getLoanSummary: builder.query<LoanSummary, { type: LoanType; dateFrom?: string; dateTo?: string }>({
      query: ({ type, dateFrom, dateTo }) => {
        const params = new URLSearchParams({ type });
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        return `/loans/summary?${params.toString()}`;
      },
      providesTags: ['Loan'],
    }),
    payLoanByMoney: builder.mutation<Loan, { loanId: number; amount: number; payDate?: string }>({
      query: ({ loanId, amount, payDate }) => ({
        url: `/loans/${loanId}/pay-money`,
        method: 'POST',
        body: { amount, payDate },
      }),
      invalidatesTags: ['Loan'],
    }),
    payLoanByProduct: builder.mutation<Loan, { loanId: number; items: { productId: number; quantity: number; unitPrice: number }[]; payDate?: string }>({
      query: ({ loanId, items, payDate }) => ({
        url: `/loans/${loanId}/pay-product`,
        method: 'POST',
        body: { items, payDate },
      }),
      invalidatesTags: ['Loan'],
    }),
    payLoanGroupByMoney: builder.mutation<Loan[], { groupId: number; amount: number; payDate?: string }>({
      query: ({ groupId, amount, payDate }) => ({
        url: `/loans/group/${groupId}/pay-money`,
        method: 'POST',
        body: { amount, payDate },
      }),
      invalidatesTags: ['Loan'],
    }),
    payLoanGroupByProduct: builder.mutation<Loan[], { groupId: number; items: { productId: number; quantity: number; unitPrice: number }[]; payDate?: string }>({
      query: ({ groupId, items, payDate }) => ({
        url: `/loans/group/${groupId}/pay-product`,
        method: 'POST',
        body: { items, payDate },
      }),
      invalidatesTags: ['Loan'],
    }),
  }),
});

export const {
  useGetLoansQuery,
  useGetLoanSummaryQuery,
  usePayLoanByMoneyMutation,
  usePayLoanByProductMutation,
  usePayLoanGroupByMoneyMutation,
  usePayLoanGroupByProductMutation,
} = loansApi;
