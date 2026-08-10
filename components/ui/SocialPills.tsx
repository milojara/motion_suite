"use client";

import React from "react";
import { SocialNetwork } from "@/types";
import { SOCIAL_NETWORKS, SOCIAL_COLORS } from "@/constants";
import { cn } from "@/lib/utils";
import { Video, Camera, Smartphone } from "lucide-react";

interface SocialPillsProps {
  value?: SocialNetwork;
  onChange: (value: SocialNetwork) => void;
  className?: string;
}

const getSocialIcon = (sn: SocialNetwork, active: boolean) => {
  const iconClass = cn("h-3.5 w-3.5 mr-1.5", active ? "opacity-100" : "opacity-50");
  switch (sn) {
    case "YouTube Shorts": return <Video className={iconClass} />;
    case "Instagram": return <Camera className={iconClass} />;
    case "TikTok": return <Smartphone className={iconClass} />;
    default: return null;
  }
};

export function SocialPills({ value, onChange, className }: SocialPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SOCIAL_NETWORKS.map((sn) => {
        const isActive = sn === value;
        const colorClass = SOCIAL_COLORS[sn];
        
        return (
          <button
            key={sn}
            type="button"
            onClick={() => onChange(sn)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border flex items-center",
              isActive 
                ? colorClass 
                : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300"
            )}
          >
            {getSocialIcon(sn, isActive)}
            {sn}
          </button>
        );
      })}
    </div>
  );
}
