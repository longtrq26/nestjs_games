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
import { useGetMeQuery, useUpdateUserMutation } from "@/state/api/authApi";
import { setUserAndAuthenticate } from "@/state/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/state/redux/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ProfilePage = () => {
  const dispatch: AppDispatch = useDispatch();

  // Lấy thông tin user từ Redux state (được cập nhật bởi AuthWrapper)
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Sử dụng useGetMeQuery để đảm bảo dữ liệu user luôn mới nhất
  // skip: chỉ fetch nếu user chưa có hoặc không được xác thực
  const {
    data: fetchedUser,
    isLoading: isFetchingUser,
    isError: isErrorFetchingUser,
  } = useGetMeQuery(undefined, {
    skip: !isAuthenticated, // Chỉ fetch nếu đã xác thực
  });

  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);

  // Sử dụng useUpdateUserMutation hook
  const [
    updateUser,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateUserMutation();

  // Cập nhật state username khi user từ Redux thay đổi
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Xử lý khi update thành công
  useEffect(() => {
    if (isUpdateSuccess && fetchedUser) {
      dispatch(setUserAndAuthenticate(fetchedUser)); // Cập nhật user trong Redux state với dữ liệu mới nhất từ server
      toast("Profile Updated");
      setIsEditing(false);
    }
  }, [isUpdateSuccess, fetchedUser, dispatch, toast]);

  // Xử lý khi update thất bại
  useEffect(() => {
    if (isUpdateError && updateError) {
      const errorMessage =
        "data" in updateError
          ? (updateError.data as any).message
          : "Failed to update profile";
      toast("Update Failed");
    }
  }, [isUpdateError, updateError, toast]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Gọi mutation để cập nhật username
    await updateUser({ username });
  };

  if (isFetchingUser || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-gray-700">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600 mb-4" />
        <p className="text-xl font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <Card className="w-full max-w-sm border border-gray-200 shadow-xl rounded-lg bg-white">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Your Profile
          </CardTitle>
          <CardDescription className="text-md text-gray-600 mt-2">
            Manage your account details and preferences.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateUsername}>
          <CardContent className="grid gap-6 px-6 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="userId"
                className="text-lg font-medium text-gray-800"
              >
                User ID
              </Label>
              <Input
                id="userId"
                value={user.id}
                readOnly
                className="bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed text-base px-4 py-2"
              />
            </div>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                readOnly={!isEditing}
                required
                className={`text-base px-4 py-2 ${
                  isEditing
                    ? "border-gray-300 focus:border-black focus:ring-black"
                    : "bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed"
                }`}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            {isEditing ? (
              <div className="flex gap-3 w-full">
                <Button
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-semibold"
                  disabled={
                    isUpdating ||
                    username === user.username.trim() ||
                    username.trim() === ""
                  }
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-400 text-gray-800 hover:bg-gray-100 transition-colors py-3 text-lg font-semibold"
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(user.username); // Reset username if canceled
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-semibold"
                onClick={() => setIsEditing(true)}
              >
                Edit Username
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
