"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/state/api/authApi";
import { setAuthCredentials } from "@/state/slices/authSlice";
import { AppDispatch } from "@/state/store";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  // Sử dụng useLoginMutation hook
  const [login, { isLoading, isSuccess, isError, error, data }] =
    useLoginMutation();

  useEffect(() => {
    if (isSuccess && data) {
      // Nếu đăng nhập thành công, lưu thông tin xác thực vào Redux state
      dispatch(
        setAuthCredentials({ user: data.user, accessToken: data.accessToken })
      );
      toast("Login Successful");
      router.push("/"); // Chuyển hướng về trang chính
    }
  }, [isSuccess, data, dispatch, router, toast]);

  useEffect(() => {
    if (isError && error) {
      // Xử lý lỗi từ mutation
      const errorMessage =
        "data" in error ? (error.data as any).message : "Login failed";
      toast("Login Failed");
    }
  }, [isError, error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gọi mutation
    await login({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <Card className="w-full max-w-sm border border-gray-200 shadow-xl rounded-lg bg-white">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-md text-gray-600 mt-2">
            Sign in to access your game hub.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {" "}
          {/* Use local handler here */}
          <CardContent className="grid gap-6 px-6 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="username"
                className="text-lg font-medium text-gray-800"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-base px-4 py-2 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-lg font-medium text-gray-800"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base px-4 py-2 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 p-6 pt-0">
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <p className="text-center text-base text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-black hover:underline font-semibold transition-colors"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
