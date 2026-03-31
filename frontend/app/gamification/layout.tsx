'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Trophy, Users, User } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/gamification', icon: Home, label: 'Home' },
    { href: '/gamification/quests', icon: Target, label: 'Quests' },
    { href: '/gamification/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/gamification/community', icon: Users, label: 'Community' },
    { href: '/gamification/profile', icon: User, label: 'Profile' },
];

export default function GamificationLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-dvh bg-[var(--color-bg-dark)] pb-20">
            {/* Main Content */}
            <main className="max-w-lg mx-auto px-4 pt-6">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-700/50">
                <div className="max-w-lg mx-auto flex items-center justify-around py-2">
                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== '/gamification' && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${isActive
                                        ? 'text-primary-400 scale-105'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-400' : ''}`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-0 w-8 h-0.5 rounded-full bg-primary-400" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
