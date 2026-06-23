import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { logout, setCredentials } from '../store/slices/authSlice';
import type { RootState } from "../store/store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_BASE_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // store the new token
        const data = refreshResult.data as { accessToken: string; refreshToken: string };
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Update user auth state in store (we don't have the user object here, but we update token)
        const user = (api.getState() as RootState).auth.user;
        if (user) {
          api.dispatch(setCredentials({ user, accessToken: data.accessToken }));
        }

        // retry the initial query
        result = await baseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem('refreshToken');
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};
