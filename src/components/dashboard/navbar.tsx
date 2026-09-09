"use client";

import {
  Menu,
  LogOut,
  UserCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

type NavbarProps = {
  userName: string;
  onMenuClick: () => void;
};

export default function Navbar({
  userName,
  onMenuClick,
}: NavbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 hover:bg-muted lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-medium">
            Personal Finance
          </p>
          <p className="text-xs text-muted-foreground">
            Kelola keuanganmu dengan lebih cerdas
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground">
            Personal Account
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <UserCircle className="h-5 w-5 text-primary" />
        </div>

        <button
          type="button"
          onClick={() =>
            signOut({
              callbackUrl: "/login",
            })
          }
          className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}