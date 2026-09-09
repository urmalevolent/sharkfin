"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Target,
  CalendarClock,
  Lightbulb,
  Bot,
  Settings,
  X,
} from "lucide-react";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const mainMenu = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Transaksi",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Wallet",
    href: "/dashboard/wallets",
    icon: Wallet,
  },
  {
    label: "Budget",
    href: "/dashboard/budgets",
    icon: PiggyBank,
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    label: "Pengeluaran Terjadwal",
    href: "/dashboard/scheduled-expenses",
    icon: CalendarClock,
  },
];

const aiMenu = [
  {
    label: "Insights",
    href: "/dashboard/insights",
    icon: Lightbulb,
  },
  {
    label: "Ask SharkFin",
    href: "/dashboard/ask-sharkfin",
    icon: Bot,
  },
];

const secondaryMenu = [
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-lg">
                🦈
              </span>
            </div>

            <div>
              <p className="font-bold leading-none">
                SharkFin
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Smart Personal Finance
              </p>
            </div>
          </Link>

          {/* Close Mobile */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {/* Main Menu */}
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Menu
          </p>

          <div className="space-y-1">
            {mainMenu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* AI Menu */}
          <p className="mb-2 mt-7 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            SharkFin AI
          </p>

          <div className="space-y-1">
            {aiMenu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span>{item.label}</span>

                  {item.label === "Ask SharkFin" && (
                    <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Menu */}
          <p className="mb-2 mt-7 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Lainnya
          </p>

          <div className="space-y-1">
            {secondaryMenu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t px-5 py-4">
          <p className="text-xs text-muted-foreground">
            SharkFin
          </p>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Personal Finance Assistant
          </p>
        </div>
      </aside>
    </>
  );
}