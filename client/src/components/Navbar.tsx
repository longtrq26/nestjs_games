"use client";

import { closeTicTacToeSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { logout } from "@/state/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/state/redux/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    closeTicTacToeSocket();
    router.push("/login");
  };

  return (
    <nav className="bg-black p-4 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          My Games
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className={cn(
              "text-lg transition-colors hover:text-gray-400",
              pathname === "/" && "font-semibold text-gray-200"
            )}
          >
            Home
          </Link>
          <Link
            href="/tic-tac-toe"
            className={cn(
              "text-lg transition-colors hover:text-gray-400",
              pathname === "/tic-tac-toe" && "font-semibold text-gray-200"
            )}
          >
            Cờ Caro
          </Link>
          <Link
            href="/line98"
            className={cn(
              "text-lg transition-colors hover:text-gray-400",
              pathname === "/line98" && "font-semibold text-gray-200"
            )}
          >
            Line 98
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  "text-lg transition-colors hover:text-gray-400",
                  pathname === "/profile" && "font-semibold text-gray-200"
                )}
              >
                Profile ({user?.username})
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-lg text-white transition-colors hover:bg-gray-800 hover:text-gray-200"
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
                  pathname === "/login" && "font-semibold text-gray-200"
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(
                  "text-lg transition-colors hover:text-gray-400",
                  pathname === "/register" && "font-semibold text-gray-200"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
