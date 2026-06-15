import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import type {
  WarehouseStockItem,
  ArrivalResponse,
  DispatchResponse,
  CreateArrivalValues,
  CreateDispatchValues,
  WarehouseType,
} from '@/interfaces/warehouses.interface';

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['WStock', 'WArrival', 'WDispatch'],
  endpoints: (builder) => ({
    getStock: builder.query<WarehouseStockItem[], { type: WarehouseType }>({
      query: ({ type }) => `/warehouse/stock?type=${type}`,
      providesTags: ['WStock'],
    }),
    getArrivals: builder.query<ArrivalResponse, { type: WarehouseType; page?: number; pageSize?: number }>({
      query: ({ type, page = 1, pageSize = 10 }) =>
        `/warehouse/arrivals?type=${type}&page=${page}&pageSize=${pageSize}`,
      providesTags: ['WArrival'],
    }),
    createArrival: builder.mutation<void, CreateArrivalValues>({
      query: (body) => ({ url: '/warehouse/arrivals', method: 'POST', body }),
      invalidatesTags: ['WArrival', 'WStock'],
    }),
    deleteArrival: builder.mutation<void, number>({
      query: (id) => ({ url: `/warehouse/arrivals/${id}`, method: 'DELETE' }),
      invalidatesTags: ['WArrival', 'WStock'],
    }),
    getDispatches: builder.query<DispatchResponse, { type: WarehouseType; page?: number; pageSize?: number }>({
      query: ({ type, page = 1, pageSize = 10 }) =>
        `/warehouse/dispatches?type=${type}&page=${page}&pageSize=${pageSize}`,
      providesTags: ['WDispatch'],
    }),
    createDispatch: builder.mutation<void, CreateDispatchValues>({
      query: (body) => ({ url: '/warehouse/dispatches', method: 'POST', body }),
      invalidatesTags: ['WDispatch', 'WStock'],
    }),
    deleteDispatch: builder.mutation<void, number>({
      query: (id) => ({ url: `/warehouse/dispatches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['WDispatch', 'WStock'],
    }),
  }),
});

export const {
  useGetStockQuery,
  useGetArrivalsQuery,
  useCreateArrivalMutation,
  useDeleteArrivalMutation,
  useGetDispatchesQuery,
  useCreateDispatchMutation,
  useDeleteDispatchMutation,
} = warehouseApi;
