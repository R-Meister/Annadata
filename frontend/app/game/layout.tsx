"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDemo } from "@/hooks/use-demo";
import { useGameStore } from "@/store/game-store";
import { XPBurst, LevelUpModal } from "@/components/gamification";
import { Home, Grid3X3, Trophy, User } from "lucide-react";

interface GameLayoutProps {
  children: React.ReactNode;
}

/**
 * Mobile-first layout for the gamified app (Krishi Quest)
 * Features bottom navigation bar like Duolingo
 */
export default function GameLayout({ children }: GameLayoutProps) {
  const pathname = usePathname();
  const { userId, isLoading } = useDemo();
  const setUserId = useGameStore((state) => state.setUserId);
  const levelBadge = useGameStore((state) => state.levelBadge);
  const xp = useGameStore((state) => state.xp);

  // Set user ID when demo hook loads
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);

  const navItems = [
    { href: "/game/home", icon: Home, label: "Home", labelHi: "होम" },
    { href: "/game/services", icon: Grid3X3, label: "Services", labelHi: "सेवाएं" },
    { href: "/game/quests", icon: Trophy, label: "Quests", labelHi: "क्वेस्ट" },
    { href: "/game/profile", icon: User, label: "Profile", labelHi: "प्रोफाइल" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌱</div>
          <p className="text-green-600 font-medium">Loading Krishi Quest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20">
      {/* Top header bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/game/home" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-green-700">Krishi Quest</span>
          </Link>

          {/* XP counter */}
          <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full">
            <span className="text-lg">{levelBadge}</span>
            <span className="font-semibold text-yellow-700">
              {xp.toLocaleString("en-IN")} XP
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-green-500 hover:bg-green-50/50"
                  )}
                >
                  <Icon
                    className={cn("w-6 h-6", isActive && "text-green-600")}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Global animations */}
      <XPBurst />
      <LevelUpModal />
    </div>
  );
}
