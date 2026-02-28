/**
 * Recharts theme configuration for Annadata OS dashboards.
 * Uses the CSS custom property design tokens for consistency.
 */

// Color palette for chart series (ordered for visual clarity)
export const CHART_COLORS = {
  primary: "#16a34a",
  primaryDark: "#15803d",
  secondary: "#f59e0b",
  accent: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  teal: "#14b8a6",
  orange: "#f97316",
  indigo: "#6366f1",
} as const;

// Ordered palette for multi-series charts
export const SERIES_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.secondary,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.teal,
  CHART_COLORS.orange,
  CHART_COLORS.indigo,
];

// Common chart props for consistent styling
export const CHART_DEFAULTS = {
  margin: { top: 5, right: 20, left: 10, bottom: 5 },
  // These work with both light and dark mode
  gridStroke: "#e7e5e4",
  axisStroke: "#78716c",
  fontSize: 11,
  tooltipStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "8px",
    padding: "8px 12px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    fontSize: "12px",
  },
  animationDuration: 800,
  animationEasing: "ease-out" as const,
} as const;

// Gauge/radial chart helper
export function getScoreColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.8) return CHART_COLORS.success;
  if (ratio >= 0.6) return CHART_COLORS.primary;
  if (ratio >= 0.4) return CHART_COLORS.secondary;
  if (ratio >= 0.2) return CHART_COLORS.warning;
  return CHART_COLORS.error;
}

// Format helpers for chart labels
export function formatTemp(value: number): string {
  return `${value.toFixed(1)}°C`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function formatPrice(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatMm(value: number): string {
  return `${value.toFixed(1)} mm`;
}
