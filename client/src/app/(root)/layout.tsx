import { AuthWrapper } from "@/components/AuthWrapper";
import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto p-4">{children}</main>
      </div>
    </AuthWrapper>
  );
};

export default Layout;
