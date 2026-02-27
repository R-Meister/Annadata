"use client";

import { cn } from "@/lib/utils";

type Status = "healthy" | "unhealthy" | "unknown";

interface StatusIndicatorProps {
  status: Status;
  label: string;
  className?: string;
}

const statusConfig: Record<Status, { color: string; pulse: boolean }> = {
  healthy: { color: "bg-[var(--color-success)]", pulse: true },
  unhealthy: { color: "bg-[var(--color-error)]", pulse: false },
  unknown: { color: "bg-[var(--color-text-muted)]", pulse: false },
};

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const { color, pulse } = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              color
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            color
          )}
        />
      </span>
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}
