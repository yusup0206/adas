import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type {
  WarehouseStockItem,
  ArrivalResponse,
  DispatchGroupResponse,
  CreateArrivalValues,
  CreateDispatchValues,
  WarehouseType,
  DispatchGroup,
} from "@/interfaces/warehouses.interface";
import { loansApi } from "./loansApi";
import { incomeApi } from "./incomeApi";

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["WStock", "WArrival", "WDispatch", "Order"],
  endpoints: (builder) => ({
    getStock: builder.query<WarehouseStockItem[], { type: WarehouseType }>({
      query: ({ type }) => `/warehouse/stock?type=${type}`,
      providesTags: ["WStock"],
    }),
    getArrivals: builder.query<
      ArrivalResponse,
      { type: WarehouseType; page?: number; pageSize?: number }
    >({
      query: ({ type, page = 1, pageSize = 10 }) =>
        `/warehouse/arrivals?type=${type}&page=${page}&pageSize=${pageSize}`,
      providesTags: ["WArrival"],
    }),
    createArrival: builder.mutation<void, CreateArrivalValues>({
      query: (body) => ({ url: "/warehouse/arrivals", method: "POST", body }),
      invalidatesTags: ["WArrival", "WStock"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Arrivals may affect income summary
        dispatch(incomeApi.util.invalidateTags(["Income"]));
      },
    }),
    deleteArrival: builder.mutation<void, number>({
      query: (id) => ({ url: `/warehouse/arrivals/${id}`, method: "DELETE" }),
      invalidatesTags: ["WArrival", "WStock"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(incomeApi.util.invalidateTags(["Income"]));
      },
    }),
    getDispatches: builder.query<
      DispatchGroupResponse,
      { type: WarehouseType; page?: number; pageSize?: number }
    >({
      query: ({ type, page = 1, pageSize = 10 }) =>
        `/warehouse/dispatches?type=${type}&page=${page}&pageSize=${pageSize}`,
      providesTags: ["WDispatch"],
    }),
    getDispatchById: builder.query<DispatchGroup, number>({
      query: (id) => `/warehouse/dispatches/${id}`,
      providesTags: (result, error, id) => [{ type: "WDispatch", id }],
    }),
    createDispatch: builder.mutation<void, CreateDispatchValues>({
      query: (body) => ({ url: "/warehouse/dispatches", method: "POST", body }),
      invalidatesTags: ["WDispatch", "WStock", "Order"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Dispatches can create loans and affect income
        dispatch(loansApi.util.invalidateTags(["Loan"]));
        dispatch(incomeApi.util.invalidateTags(["Income"]));
      },
    }),
    deleteDispatch: builder.mutation<void, number>({
      query: (id) => ({ url: `/warehouse/dispatches/${id}`, method: "DELETE" }),
      invalidatesTags: ["WDispatch", "WStock"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Deleting a dispatch may remove loans and affect income
        dispatch(loansApi.util.invalidateTags(["Loan"]));
        dispatch(incomeApi.util.invalidateTags(["Income"]));
      },
    }),
  }),
});

export const {
  useGetStockQuery,
  useGetArrivalsQuery,
  useCreateArrivalMutation,
  useDeleteArrivalMutation,
  useGetDispatchesQuery,
  useGetDispatchByIdQuery,
  useCreateDispatchMutation,
  useDeleteDispatchMutation,
} = warehouseApi;
