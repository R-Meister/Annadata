import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-dvh gradient-hero flex items-center justify-center">
            <div className="text-center max-w-2xl px-6">
                {/* Placeholder for hero illustration */}
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-6xl">🌾</span>
                </div>

                <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                    Khelein, Seekhein, Ugaayein
                </h1>
                <p className="text-xl text-slate-300 mb-2">
                    खेलें, सीखें, उगाएं
                </p>
                <p className="text-lg text-slate-400 mb-10 max-w-md mx-auto">
                    A gamified platform that makes sustainable farming a goal, a game, and a movement.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/gamification"
                        className="px-8 py-4 rounded-2xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
                    >
                        Enter Platform →
                    </Link>
                    <Link
                        href="/gamification/onboarding"
                        className="px-8 py-4 rounded-2xl border border-slate-600 text-slate-200 font-semibold text-lg hover:bg-slate-800 transition-colors"
                    >
                        New Farmer? Register
                    </Link>
                </div>

                <p className="mt-12 text-sm text-slate-500">
                    Part of the <span className="text-primary-400 font-medium">Annadata</span> Ecosystem
                </p>
            </div>
        </div>
    );
}
