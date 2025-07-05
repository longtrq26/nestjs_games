// src/components/AuthWrapper.tsx
"use client";

import { useGetMeQuery } from "@/state/api/authApi";
import {
  logout,
  setAccessTokenFromStorage,
  setUserAndAuthenticate,
} from "@/state/redux/slices/authSlice";
import { AppDispatch, persistor, RootState, store } from "@/state/redux/store";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const pathname = usePathname();

  // 2. Sử dụng useGetMeQuery để tự động gọi API /users/me
  // Query này sẽ CHỈ chạy nếu có accessToken trong Redux state VÀ isAuthenticated đang là FALSE.
  // Điều này đảm bảo rằng chúng ta luôn xác minh token với server khi có token nhưng chưa xác thực.
  const {
    data: userData,
    isLoading: isAuthLoading,
    isFetching: isAuthFetching,
    isError: isAuthError,
    error: authError,
  } = useGetMeQuery(undefined, {
    skip: !accessToken || isAuthenticated, // Quan trọng: chỉ fetch nếu có token VÀ CHƯA xác thực
    // refetchOnMountOrArgChange: true, // Có thể bỏ qua nếu logic skip đủ mạnh
  });

  // 3. Cập nhật Redux state khi userData từ useGetMeQuery thành công
  // Đây là lúc isAuthenticated thực sự được đặt thành true
  useEffect(() => {
    if (userData) {
      dispatch(setUserAndAuthenticate(userData));
    }
  }, [userData, dispatch]);

  // 4. Xử lý lỗi từ useGetMeQuery (ví dụ: token hết hạn, không hợp lệ)
  useEffect(() => {
    if (isAuthError && authError) {
      console.error("Failed to verify access token:", authError);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("persist:root");
      persistor.purge(); // ✅ full reset
      dispatch(logout());
      toast("Please log in again.");

      if (pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      }
    }
  }, [isAuthError, authError, dispatch, router, toast]);

  // 5. Logic chuyển hướng nếu chưa xác thực và không ở trang public (login/register)
  useEffect(() => {
    const publicPaths = ["/login", "/register"];
    const currentPath = pathname;

    // Nếu không có token TRONG REDUX STATE VÀ KHÔNG XÁC THỰC, và KHÔNG ở trang public, thì chuyển hướng
    if (
      !accessToken &&
      !isAuthenticated &&
      !publicPaths.includes(currentPath)
    ) {
      router.push("/login");
    }
  }, [accessToken, isAuthenticated, router]);

  // Logic hiển thị trạng thái tải ban đầu
  // Hiển thị loading nếu có accessToken nhưng chưa xác thực VÀ đang trong quá trình fetch
  const showLoadingState =
    (isAuthLoading || isAuthFetching) && accessToken && !isAuthenticated;

  // Nếu đang ở trang public (login/register), luôn hiển thị children ngay lập tức
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>; // always render public pages
  }

  // Nếu đã xác thực thành công, hiển thị children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Nếu đang trong quá trình tải xác thực, hiển thị loading
  if (showLoadingState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p> {/* Hoặc một spinner đẹp hơn */}
      </div>
    );
  }

  // Fallback: nếu không có token, không xác thực, và không ở trang public,
  // thì useEffect chuyển hướng sẽ xử lý. Component sẽ không render gì cho đến khi đó.
  return null;
}
