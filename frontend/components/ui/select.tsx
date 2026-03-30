"use client";

import * as React from "react";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

export function SelectTrigger({ className = "", children }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${context.open ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  return (
    <span className={context.value ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
      {context.value || placeholder}
    </span>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

  if (!context.open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      {/* Dropdown */}
      <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-md animate-in fade-in-0 zoom-in-95">
        {children}
      </div>
    </>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const isSelected = context.value === value;

  return (
    <div
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 ${
        isSelected ? "bg-[var(--color-primary)]/5" : ""
      }`}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
}
