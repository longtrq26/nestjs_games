import type {
  HintMove,
  Line98GameStatePayload,
  Line98Response,
  Line98Server,
} from "@/types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const line98Api = createApi({
  reducerPath: "line98Api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Line98Game"],
  endpoints: (builder) => ({
    createLine98Game: builder.mutation<Line98Response<Line98Server>, void>({
      query: () => ({ url: "/line98/create", method: "POST" }),
      invalidatesTags: ["Line98Game"],
    }),

    getLine98GameState: builder.query<
      Line98Response<Line98GameStatePayload>,
      string
    >({
      query: (gameId) => `/line98/${gameId}`,
      providesTags: (res, _err, gameId) =>
        res?.data ? [{ type: "Line98Game", id: gameId }] : ["Line98Game"],
    }),

    moveLine98Ball: builder.mutation<
      Line98Response<Line98GameStatePayload>,
      { gameId: string; from: number; to: number }
    >({
      query: (body) => ({
        url: "/line98/move",
        method: "POST",
        body,
      }),
      async onQueryStarted({ gameId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            line98Api.util.updateQueryData(
              "getLine98GameState",
              gameId,
              (draft) => {
                if (draft?.data) Object.assign(draft.data, data.data);
              }
            )
          );
        } catch (err) {
          console.error("Failed to patch game cache", err);
        }
      },
      invalidatesTags: (_, __, { gameId }) => [
        { type: "Line98Game", id: gameId },
      ],
    }),

    getLine98Hint: builder.mutation<
      Line98Response<HintMove | null>,
      { gameId: string }
    >({
      query: (body) => ({
        url: "/line98/hint",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateLine98GameMutation,
  useGetLine98GameStateQuery,
  useMoveLine98BallMutation,
  useGetLine98HintMutation,
} = line98Api;
