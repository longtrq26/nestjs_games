"use client";

import { useGetMeQuery } from "@/state/api/authApi";
import { logout, setUserAndAuthenticate } from "@/state/redux/slices/authSlice";
import { AppDispatch, persistor, RootState } from "@/state/redux/store";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export function AuthWrapper({ children }: { children: ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const pathname = usePathname();

  // Tự động gọi /users/me
  const {
    data: userData,
    isLoading: isAuthLoading,
    isFetching: isAuthFetching,
    isError: isAuthError,
    error: authError,
  } = useGetMeQuery(undefined, {
    skip: !accessToken || isAuthenticated,
  });

  // Cập nhật state khi userData từ useGetMeQuery thành công
  useEffect(() => {
    if (userData) {
      dispatch(setUserAndAuthenticate(userData));
    }
  }, [userData, dispatch]);

  // Xử lý lỗi
  useEffect(() => {
    if (isAuthError && authError) {
      console.error("Failed to verify access token:", authError);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("persist:root");
      persistor.purge();
      dispatch(logout());
      toast("Please log in again.");

      if (pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      }
    }
  }, [isAuthError, authError, dispatch, router, toast]);

  // Redirect nếu chưa xác thực
  useEffect(() => {
    const publicPaths = ["/login", "/register"];
    const currentPath = pathname;

    if (
      !accessToken &&
      !isAuthenticated &&
      !publicPaths.includes(currentPath)
    ) {
      router.push("/login");
    }
  }, [accessToken, isAuthenticated, router]);

  const showLoadingState =
    (isAuthLoading || isAuthFetching) && accessToken && !isAuthenticated;

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (showLoadingState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return null;
}
