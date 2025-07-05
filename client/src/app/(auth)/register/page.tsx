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
import { useRegisterMutation } from "@/state/api/authApi";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Sử dụng useRegisterMutation hook
  const [register, { isLoading, isSuccess, isError, error }] =
    useRegisterMutation();

  useEffect(() => {
    if (isSuccess) {
      toast("Registration Successful");
      router.push("/login"); // Chuyển hướng về trang đăng nhập sau khi đăng ký thành công
    }
  }, [isSuccess, router, toast]);

  useEffect(() => {
    if (isError && error) {
      // Xử lý lỗi từ mutation
      const errorMessage =
        "data" in error ? (error.data as any).message : "Registration failed";
      toast("Registration Failed");
    }
  }, [isError, error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gọi mutation
    await register({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <Card className="w-full max-w-sm border border-gray-200 shadow-xl rounded-lg bg-white">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-md text-gray-600 mt-2">
            Join the game hub and start playing!
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
                placeholder="Choose a username"
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
                placeholder="Create a strong password"
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
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
            <p className="text-center text-base text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black hover:underline font-semibold transition-colors"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
