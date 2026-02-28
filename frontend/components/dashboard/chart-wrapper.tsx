"use client";

import { ReactNode } from "react";

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
  className?: string;
}

/**
 * Reusable wrapper for chart sections with consistent styling.
 */
export function ChartWrapper({
  title,
  subtitle,
  children,
  height = 300,
  className = "",
}: ChartWrapperProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}

/**
 * Small stat card with optional sparkline or change indicator.
 */
export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-green-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-[var(--color-text-muted)]";

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-[var(--color-text-muted)]">{icon}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
      )}
    </div>
  );
}
