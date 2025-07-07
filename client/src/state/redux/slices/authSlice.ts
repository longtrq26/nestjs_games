import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: { id: string; username: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

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
    // Thiết lập user và token sau khi đăng nhập thành công
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

    // Xóa thông tin xác thực khi đăng xuất
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },

    // Action này chỉ để đặt accessToken vào Redux state từ localStorage khi KHỞI ĐỘNG
    // KHÔNG đặt isAuthenticated ở đây, vì token chưa được server xác minh
    setAccessTokenFromStorage(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      // state.isAuthenticated vẫn là false cho đến khi server xác minh token
    },

    // Gọi khi user info được tải thành công từ server
    setUserAndAuthenticate(
      state,
      action: PayloadAction<{ id: string; username: string } | null>
    ) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload; // Chỉ set true khi có user data hợp lệ
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
