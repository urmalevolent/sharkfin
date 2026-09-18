"use client";

import { useState } from "react";

import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";
import AskSharkFinModal from "@/components/ai/ask-sharkfin-modal";

type DashboardShellProps = {
  children: React.ReactNode;
  userName: string;
};

export default function DashboardShell({
  children,
  userName,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [askSharkFinOpen, setAskSharkFinOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAskSharkFin={() => {
          setAskSharkFinOpen(true);
          setSidebarOpen(false);
        }}
      />

      <div className="lg:pl-64">
        <Navbar
          userName={userName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        <Footer />
      </div>

      <AskSharkFinModal
        open={askSharkFinOpen}
        onClose={() => setAskSharkFinOpen(false)}
        userName={userName}
      />
    </div>
  );
}