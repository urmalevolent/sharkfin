"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";

type DashboardLayoutProps = {
  children: ReactNode;
  userName: string;
};

export default function DashboardLayout({
  children,
  userName,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          userName={userName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}