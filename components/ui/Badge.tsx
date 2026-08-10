import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-zinc-50 text-zinc-900": variant === "default",
          "border-transparent bg-zinc-800 text-zinc-50": variant === "secondary",
          "border-transparent bg-red-500/10 text-red-500": variant === "danger",
          "border-transparent bg-emerald-500/10 text-emerald-500": variant === "success",
          "text-zinc-50 border-zinc-800": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
