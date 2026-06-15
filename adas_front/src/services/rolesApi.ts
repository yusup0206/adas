import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Role'],
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['Role'],
    }),
    createRole: builder.mutation({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
