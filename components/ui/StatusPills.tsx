"use client";

import React from "react";
import { Status } from "@/types";
import { STATUSES, STATUS_COLORS } from "@/constants";
import { cn } from "@/lib/utils";

interface StatusPillsProps {
  status: Status;
  onChange: (status: Status) => void;
  className?: string;
}

export function StatusPills({ status, onChange, className }: StatusPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {STATUSES.map((s) => {
        const isActive = s === status;
        const colorClass = STATUS_COLORS[s];
        
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              isActive 
                ? colorClass 
                : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300"
            )}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
