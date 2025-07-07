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
import { setUserAndAuthenticate } from "@/state/slices/authSlice";
import { AppDispatch, RootState } from "@/state/store";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const ProfilePage = () => {
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Sử dụng useGetMeQuery để đảm bảo dữ liệu user luôn mới nhất
  const { data: fetchedUser, isLoading: isFetchingUser } = useGetMeQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

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

  // Cập nhật state username khi user thay đổi
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Xử lý khi update thành công
  useEffect(() => {
    if (isUpdateSuccess && fetchedUser) {
      // Cập nhật user state với dữ liệu mới nhất từ server
      dispatch(setUserAndAuthenticate(fetchedUser));
      toast("Profile Updated");
      setIsEditing(false);
    }
  }, [isUpdateSuccess, fetchedUser, dispatch, toast]);

  // Xử lý khi update thất bại
  useEffect(() => {
    if (isUpdateError) {
      const errorMessage =
        (updateError as any)?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    }
  }, [isUpdateError, updateError, toast]);

  const handleUpdate = async (e: React.FormEvent) => {
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
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-2xl">
        <CardHeader className="text-center pt-8 pb-4 space-y-1">
          <CardTitle className="text-4xl font-bold text-gray-900">
            Your Profile
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Update your account details
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdate}>
          <CardContent className="px-6 py-4 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="userId"
                className="text-sm font-medium text-gray-700"
              >
                User ID
              </Label>
              <Input
                id="userId"
                value={user.id}
                readOnly
                className="text-gray-600 bg-gray-100 cursor-not-allowed border-gray-200 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                readOnly={!isEditing}
                required
                className={`text-base ${
                  isEditing
                    ? "border-gray-300 focus:border-black focus:ring-black"
                    : "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                }`}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            {isEditing ? (
              <div className="flex gap-3 w-full">
                <Button
                  type="submit"
                  disabled={
                    isUpdating ||
                    username.trim() === "" ||
                    username.trim() === user.username.trim()
                  }
                  className="flex-1 bg-black text-white hover:bg-gray-800 text-base font-semibold py-2.5"
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
                  onClick={() => {
                    setUsername(user.username);
                    setIsEditing(false);
                  }}
                  disabled={isUpdating}
                  className="flex-1 text-base font-semibold py-2.5"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full bg-black text-white hover:bg-gray-800 text-base font-semibold py-2.5"
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
