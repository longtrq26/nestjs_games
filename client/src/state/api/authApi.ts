import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Lấy accessToken từ Redux store
      const accessToken = (getState() as RootState).auth.accessToken;
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<
      { message: string }, // Kiểu dữ liệu trả về thành công
      { username: string; password: string } // Kiểu dữ liệu request body
    >({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),

    login: builder.mutation<
      { user: { id: string; username: string }; accessToken: string }, // Kiểu dữ liệu trả về thành công
      { username: string; password: string } // Kiểu dữ liệu request body
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
      { id: string; username: string }, // Kiểu dữ liệu trả về thành công
      { username: string } // Kiểu dữ liệu request body
    >({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body: body,
      }),
      // Invalidates the 'getMe' query to refetch user data after update
      // Điều này đảm bảo rằng sau khi update, useGetMeQuery sẽ tự động fetch lại dữ liệu mới nhất
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateUserMutation,
} = authApi;
