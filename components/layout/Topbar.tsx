"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

export function Topbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-800 bg-zinc-950 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          {/* Add global search or breadcrumbs here in the future */}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-800" aria-hidden="true" />
          
          <div className="flex items-center gap-x-4">
            <span className="sr-only">Your profile</span>
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium leading-6 text-zinc-50" aria-hidden="true">
                {user?.displayName || 'Usuario'}
              </span>
            </div>
            {user?.photoURL ? (
              <img
                className="h-8 w-8 rounded-full bg-zinc-800"
                src={user.photoURL}
                alt=""
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-800" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
