"use client";

import { closeTicTacToeSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { useLogoutMutation } from "@/state/api/authApi";
import { logout } from "@/state/slices/authSlice";
import { AppDispatch, RootState } from "@/state/store";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tic-tac-toe", label: "Tic Tac Toe" },
  { href: "/line98", label: "Line 98" },
  { href: "/profile", label: "Profile" },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken
  );
  const [serverLogout] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (!refreshToken) {
      // không có refresh token xóa trạng thái client
      dispatch(logout());
      closeTicTacToeSocket();
      router.push("/login");
      toast.info("You have been logged out.");
      return;
    }

    try {
      // Gửi yêu cầu đăng xuất tới server để vô hiệu hóa refresh token
      await serverLogout({ refreshToken }).unwrap();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Failed to logout from server:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      // Luôn xóa trạng thái client và chuyển hướng, bất kể server logout thành công hay thất bại
      dispatch(logout());
      closeTicTacToeSocket();
      router.push("/login");
    }
  };

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Game Hub
        </Link>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-lg transition-colors hover:text-gray-400",
                pathname === href &&
                  "font-semibold underline underline-offset-4"
              )}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-lg text-white hover:bg-gray-800 hover:text-gray-200"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "text-lg transition-colors hover:text-gray-400",
                  pathname === "/login" &&
                    "font-semibold underline underline-offset-4"
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(
                  "text-lg transition-colors hover:text-gray-400",
                  pathname === "/register" &&
                    "font-semibold underline underline-offset-4"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block py-2 text-lg transition hover:text-gray-300",
                pathname === href && "font-semibold text-gray-200 underline"
              )}
            >
              {label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                variant="ghost"
                className="w-full text-left text-white hover:bg-gray-800 hover:text-gray-200"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block py-2 text-lg transition hover:text-gray-300",
                  pathname === "/login" &&
                    "font-semibold text-gray-200 underline"
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block py-2 text-lg transition hover:text-gray-300",
                  pathname === "/register" &&
                    "font-semibold text-gray-200 underline"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
