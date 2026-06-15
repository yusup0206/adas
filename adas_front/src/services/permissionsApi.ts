import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: () => '/permissions',
    }),
  }),
});

export const { useGetPermissionsQuery } = permissionsApi;
