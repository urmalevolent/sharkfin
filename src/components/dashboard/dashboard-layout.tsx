"use client";

import { ReactNode, useState } from "react";

import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";
import AskSharkFinModal from "@/components/ai/ask-sharkfin-modal";

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

  const [askSharkFinOpen, setAskSharkFinOpen] =
    useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* ========================================
          SIDEBAR
      ======================================== */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAskSharkFin={() =>
          setAskSharkFinOpen(true)
        }
      />

      {/* ========================================
          MAIN CONTENT
      ======================================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          userName={userName}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>

      {/* ========================================
          ASK SHARKFIN GLOBAL MODAL
      ======================================== */}
      <AskSharkFinModal
        open={askSharkFinOpen}
        userName={userName}
        onClose={() =>
          setAskSharkFinOpen(false)
        }
      />
    </div>
  );
}