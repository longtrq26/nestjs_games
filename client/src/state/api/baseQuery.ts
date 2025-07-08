import { logout, setAuthCredentials } from "@/state/slices/authSlice";
import type { RootState } from "@/state/store";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<any, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(logout());
      localStorage.removeItem("persist:root");
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken, refreshToken, user } = refreshResult.data as {
        accessToken: string;
        refreshToken: string;
        user: { id: string; username: string };
      };

      if (accessToken && refreshToken && user) {
        api.dispatch(setAuthCredentials({ accessToken, refreshToken, user }));

        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        localStorage.removeItem("persist:root");
      }
    } else {
      api.dispatch(logout());
      localStorage.removeItem("persist:root");
    }
  }

  return result;
};
