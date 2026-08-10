"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  textClassName?: string;
  inputClassName?: string;
  type?: "text" | "url";
}

export function InlineEdit({
  value,
  onSave,
  placeholder = "Vacío",
  className,
  textClassName,
  inputClassName,
  type = "text",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all",
          inputClassName,
          className
        )}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text rounded-md px-1 py-1 -mx-1 transition-colors hover:bg-zinc-800/50 min-h-[1.5rem] flex items-center",
        !value && "text-zinc-500 italic",
        className
      )}
    >
      <span className={cn("truncate", textClassName)}>
        {value || placeholder}
      </span>
    </div>
  );
}
