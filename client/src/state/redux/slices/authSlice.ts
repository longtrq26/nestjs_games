// src/lib/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: { id: string; username: string } | null;
  accessToken: string | null;
  // isAuthenticated chỉ là true khi user data được tải thành công từ token
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action để thiết lập user và token sau khi đăng nhập thành công
    setAuthCredentials(
      state,
      action: PayloadAction<{
        user: { id: string; username: string };
        accessToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true; // Đăng nhập thành công, nên xác thực là true
    },

    // Action để xóa thông tin xác thực khi đăng xuất
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

    // Action này được gọi khi THÔNG TIN USER được tải thành công từ server (qua useGetMeQuery)
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
