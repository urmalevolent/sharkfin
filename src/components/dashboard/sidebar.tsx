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
  ChevronRight,
} from "lucide-react";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onAskSharkFin: () => void;
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
  onAskSharkFin,
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
      {/* ========================================
          MOBILE OVERLAY
      ======================================== */}
      {open && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-slate-950/50
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* ========================================
          SIDEBAR
      ======================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-[260px] shrink-0
          flex-col
          bg-[#07152F]
          text-white
          shadow-2xl shadow-slate-950/20
          transition-transform duration-300 ease-out

          lg:sticky
          lg:top-0
          lg:z-40
          lg:translate-x-0

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ======================================
            BRAND
        ====================================== */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="group flex items-center gap-3"
          >
            {/* Logo */}
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-[#168CFF]
                shadow-lg shadow-blue-950/30
                transition-transform duration-200
                group-hover:scale-105
              "
            >
              <span className="text-lg">
                🦈
              </span>
            </div>

            {/* Brand */}
            <div className="min-w-0">
              <p className="text-[17px] font-bold leading-none tracking-tight text-white">
                SharkFin
              </p>

              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                Capital Engine
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="
              rounded-lg p-2
              text-slate-400
              transition
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================
            NAVIGATION
        ====================================== */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
          {/* Main Menu */}
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                  className={`
                    group flex items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-[13px] font-medium
                    transition-all duration-200

                    ${
                      active
                        ? `
                          bg-[#0B63E5]
                          text-white
                          shadow-md shadow-blue-950/20
                        `
                        : `
                          text-slate-400
                          hover:bg-white/[0.06]
                          hover:text-white
                        `
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[18px] w-[18px] shrink-0
                      transition-colors duration-200

                      ${
                        active
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    `}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  {active && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-white/70"
                      strokeWidth={2}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ====================================
              AI MENU
          ==================================== */}
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            SharkFin AI
          </p>

          <div className="space-y-1">
            {aiMenu.map((item) => {
              const Icon = item.icon;

              /*
               * Ask SharkFin sekarang bukan Link.
               * Klik akan membuka modal.
               */
              if (item.label === "Ask SharkFin") {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onAskSharkFin();
                      onClose();
                    }}
                    className="
                      group flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-[13px] font-medium
                      text-slate-400
                      transition-all duration-200
                      hover:bg-white/[0.06]
                      hover:text-white
                    "
                  >
                    <Icon
                      className="
                        h-[18px] w-[18px] shrink-0
                        text-slate-500
                        transition-colors duration-200
                        group-hover:text-slate-300
                      "
                      strokeWidth={1.8}
                    />

                    <span className="min-w-0 flex-1 truncate text-left">
                      {item.label}
                    </span>

                    {/* AI Badge */}
                    <span
                      className="
                        rounded-md
                        bg-[#168CFF]/10
                        px-1.5 py-0.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-[#5BAEFF]
                      "
                    >
                      AI
                    </span>
                  </button>
                );
              }

              /*
               * Menu AI lainnya tetap menggunakan Link.
               */
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-[13px] font-medium
                    transition-all duration-200

                    ${
                      active
                        ? `
                          bg-[#0B63E5]
                          text-white
                          shadow-md shadow-blue-950/20
                        `
                        : `
                          text-slate-400
                          hover:bg-white/[0.06]
                          hover:text-white
                        `
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[18px] w-[18px] shrink-0
                      transition-colors duration-200

                      ${
                        active
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    `}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  {active && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-white/70"
                      strokeWidth={2}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ====================================
              SECONDARY MENU
          ==================================== */}
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                  className={`
                    group flex items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-[13px] font-medium
                    transition-all duration-200

                    ${
                      active
                        ? `
                          bg-[#0B63E5]
                          text-white
                          shadow-md shadow-blue-950/20
                        `
                        : `
                          text-slate-400
                          hover:bg-white/[0.06]
                          hover:text-white
                        `
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[18px] w-[18px] shrink-0
                      transition-colors duration-200

                      ${
                        active
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    `}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  {active && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-white/70"
                      strokeWidth={2}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ======================================
            SIDEBAR FOOTER
        ====================================== */}
        <div className="shrink-0 border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <p className="text-[10px] font-medium text-slate-400">
              Sistem Aktif
            </p>
          </div>

          <p className="mt-1 text-[10px] text-slate-600">
            SharkFin Personal Finance
          </p>
        </div>
      </aside>
    </>
  );
}