import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";

// Định nghĩa kiểu dữ liệu cho Line98 Game State từ backend
export interface Line98GameStatePayload {
  gameId: string;
  boardState: string[]; // Mảng các ký tự màu bóng/trống
  nextBalls: string[]; // Mảng 3 ký tự màu bóng tiếp theo
  score: number;
  status: "IN_PROGRESS" | "FINISHED";
}

export interface HintMove {
  from: number;
  to: number;
  score: number;
  type: "clear" | "potential_line" | "movable";
}

export const line98Api = createApi({
  reducerPath: "line98Api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = (getState() as RootState).auth.accessToken;
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Line98Game"], // Thêm tag type để quản lý cache
  endpoints: (builder) => ({
    // Endpoint để tạo game Line 98 mới
    createLine98Game: builder.mutation<
      { message: string; gameId: string }, // Kiểu trả về
      void // Không cần body
    >({
      query: () => ({
        url: "/line98/create",
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Line98Game"], // Khi tạo game mới, invalidate cache
    }),

    // Endpoint để lấy trạng thái game Line 98 theo ID
    getLine98GameState: builder.query<Line98GameStatePayload, string>({
      query: (gameId) => `/line98/${gameId}`,
      providesTags: (result, error, id) => [{ type: "Line98Game", id }], // Cung cấp tag cho query
    }),

    // Endpoint để di chuyển bóng
    moveLine98Ball: builder.mutation<
      Line98GameStatePayload, // Kiểu trả về (trạng thái game mới)
      { gameId: string; from: number; to: number } // Kiểu body
    >({
      query: (body) => ({
        url: "/line98/move",
        method: "POST",
        body: body,
      }),
      // Khi move ball thành công, update lại cache cho game đó
      async onQueryStarted({ gameId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedGame } = await queryFulfilled;
          dispatch(
            line98Api.util.updateQueryData(
              "getLine98GameState",
              gameId,
              (draft) => {
                Object.assign(draft, updatedGame); // Cập nhật trạng thái game trong cache
              }
            )
          );
        } catch (error) {
          console.error("Failed to update cache after move:", error);
        }
      },
      invalidatesTags: (result, error, { gameId }) => [
        { type: "Line98Game", id: gameId },
      ],
    }),

    // Endpoint để lấy gợi ý nước đi
    getLine98Hint: builder.mutation<
      { message: string; hint?: HintMove }, // Kiểu trả về
      { gameId: string } // Kiểu body
    >({
      query: (body) => ({
        url: "/line98/hint",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

// Export các hooks được tạo tự động
export const {
  useCreateLine98GameMutation,
  useGetLine98GameStateQuery,
  useMoveLine98BallMutation,
  useGetLine98HintMutation,
} = line98Api;
