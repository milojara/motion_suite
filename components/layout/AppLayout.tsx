"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { LayoutDashboard, Film, Settings, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: "Contenido", href: ROUTES.CONTENT, icon: Film },
  { name: "Privado", href: ROUTES.PRIVATE, icon: Lock },
  { name: "Configuración", href: ROUTES.SETTINGS, icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full p-4 sm:p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md px-4 pb-safe">
          {mobileNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors",
                  isActive ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <item.icon className={cn("h-6 w-6 mb-1", isActive ? "text-zinc-50" : "text-zinc-500")} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
