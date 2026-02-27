"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ScanLine,
  Shield,
  Droplets,
  Wheat,
  MessageCircle,
  Settings,
  User,
  ChevronLeft,
  Dna,
  CreditCard,
  Truck,
  BadgeCheck,
  CloudSun,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "MSP Mitra", href: "/dashboard/msp-mitra", icon: BarChart3 },
  { label: "SoilScan AI", href: "/dashboard/soilscan", icon: ScanLine },
  { label: "Fasal Rakshak", href: "/dashboard/fasal-rakshak", icon: Shield },
  { label: "Jal Shakti", href: "/dashboard/jal-shakti", icon: Droplets },
  { label: "Harvest Shakti", href: "/dashboard/harvest-shakti", icon: Wheat },
  { label: "Kisaan Sahayak", href: "/dashboard/kisaan-sahayak", icon: MessageCircle },
  { label: "Protein Engineering", href: "/dashboard/protein-engineering", icon: Dna },
  { label: "Kisan Credit", href: "/dashboard/kisan-credit", icon: CreditCard },
  { label: "Harvest-to-Cart", href: "/dashboard/harvest-to-cart", icon: Truck },
  { label: "Beej Suraksha", href: "/dashboard/beej-suraksha", icon: BadgeCheck },
  { label: "Mausam Chakra", href: "/dashboard/mausam-chakra", icon: CloudSun },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Title */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold text-sm">
              A
            </div>
            <span className="text-lg font-semibold text-[var(--color-text)]">
              Annadata
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-border)] lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom user / settings section */}
        <div className="border-t border-[var(--color-border)] p-3">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/dashboard/settings"
                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </Link>

          <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-border)]">
              <User className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--color-text)]">
                Farmer
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                View profile
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
