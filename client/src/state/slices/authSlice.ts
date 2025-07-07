import { AuthState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthCredentials(
      state,
      action: PayloadAction<{
        user: { id: string; username: string };
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },

    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },

    setAccessTokenFromStorage(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },

    setUserAndAuthenticate(
      state,
      action: PayloadAction<{ id: string; username: string } | null>
    ) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const {
  setAuthCredentials,
  logout,
  setAccessTokenFromStorage,
  setUserAndAuthenticate,
} = authSlice.actions;

export default authSlice.reducer;
