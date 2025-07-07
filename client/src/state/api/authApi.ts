import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setAuthCredentials } from "../redux/slices/authSlice";
import { RootState } from "../redux/store";

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

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Thử làm mới token
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      // Nếu không có refresh token, không thể làm mới, đăng xuất
      api.dispatch(logout());
      return result;
    }

    console.log("Attempting to refresh token...");
    // Gọi endpoint refresh token
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
      // Refresh thành công, lưu token mới vào Redux store
      const newAuthData = refreshResult.data as {
        accessToken: string;
        refreshToken: string;
        user: { id: string; username: string };
      };
      api.dispatch(
        setAuthCredentials({
          accessToken: newAuthData.accessToken,
          refreshToken: newAuthData.refreshToken,
          user: newAuthData.user,
        })
      );
      // Thử lại yêu cầu gốc với token mới
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh thất bại, đăng xuất người dùng
      console.error("Failed to refresh token:", refreshResult.error);
      api.dispatch(logout());
      // Xóa tất cả từ localStorage
      localStorage.removeItem("persist:root");
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],

  endpoints: (builder) => ({
    register: builder.mutation<
      { message: string },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),

    login: builder.mutation<
      {
        user: { id: string; username: string };
        accessToken: string;
        refreshToken: string;
      },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getMe: builder.query<{ id: string; username: string }, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),

    updateUser: builder.mutation<
      { id: string; username: string },
      { username: string }
    >({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateUserMutation,
  useLogoutMutation,
} = authApi;
