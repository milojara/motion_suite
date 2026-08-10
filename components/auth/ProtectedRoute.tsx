"use client";

import { useAuth } from "@/hooks/useAuth";
import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-50" />
      </div>
    );
  }

  if (!user) {
    return null; // The useAuth hook handles the redirect to /login
  }

  return <>{children}</>;
}
