"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Film,
  Settings,
  LogOut,
  Lock
} from "lucide-react";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: "Contenido", href: ROUTES.CONTENT, icon: Film },
  { name: "Privado", href: ROUTES.PRIVATE, icon: Lock },
  { name: "Configuración", href: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 shadow-inner border border-zinc-800">
          <Film className="h-4 w-4 text-zinc-50" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-zinc-50">
          FrameFlow
        </span>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-zinc-800/80 text-zinc-50 shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-50"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-300"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-zinc-500 group-hover:text-red-500" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
