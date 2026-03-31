'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useFarmerStore } from '@/store/farmerStore';

const SLIDES = [
    {
        emoji: '🌾',
        title: 'Welcome to Annadata',
        subtitle: 'Khelein, Seekhein, Ugaayein',
        description: 'Learn sustainable farming through fun quests, earn XP and build your farming legacy.',
        hint: 'खेलें, सीखें, उगाएं — टिकाऊ खेती सीखें खेल-खेल में',
    },
    {
        emoji: '🎯',
        title: 'Complete Quests',
        subtitle: 'Earn XP & Level Up',
        description: 'Accept personalized missions — from composting to drip irrigation. Complete them, upload proof, and earn experience points.',
        hint: 'AI picks the best quests for your crop, land, and location',
    },
    {
        emoji: '🏆',
        title: 'Compete & Share',
        subtitle: 'Leaderboards & Community',
        description: 'Climb village, district, and state leaderboards. Share your farming story and inspire others.',
        hint: 'Top farmers get real-world rewards and recognition!',
    },
];

const CROPS = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Soybean', 'Banana', 'Potato', 'Tomato', 'Chickpea', 'Mustard', 'Other'];
const STATES = ['Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Tamil Nadu', 'Karnataka', 'Punjab', 'Haryana', 'Bihar', 'Gujarat', 'Telangana', 'Other'];

export default function OnboardingPage() {
    const router = useRouter();
    const { loadDemoProfile } = useFarmerStore();
    const [step, setStep] = useState(0); // 0-2 = slides, 3 = registration form
    const [form, setForm] = useState({
        name: '', phone: '', village: '', district: '', state: '', crop: '', farmSize: '',
    });

    const handleFinish = () => {
        loadDemoProfile();
        router.push('/gamification');
    };

    if (step <= 2) {
        const slide = SLIDES[step];
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                {/* Placeholder for onboarding illustration */}
                <div className="w-32 h-32 rounded-full bg-primary-500/15 flex items-center justify-center mb-8 animate-float">
                    <span className="text-6xl">{slide.emoji}</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">{slide.title}</h1>
                <p className="text-sm text-primary-400 mb-3">{slide.subtitle}</p>
                <p className="text-sm text-slate-400 max-w-sm mb-2">{slide.description}</p>
                <p className="text-xs text-slate-500 italic">{slide.hint}</p>

                {/* Dots */}
                <div className="flex gap-2 my-8">
                    {SLIDES.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-6 bg-primary-500' : 'bg-slate-600'}`} />
                    ))}
                </div>

                <div className="flex gap-4">
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)} className="p-3 rounded-xl glass text-slate-300 hover:bg-slate-700">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setStep(step + 1)}
                        className="px-8 py-3 rounded-2xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90"
                    >
                        {step < 2 ? 'Next' : 'Get Started'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // Registration Form
    return (
        <div className="space-y-6 animate-count-up">
            <div className="flex items-center gap-3">
                <button onClick={() => setStep(2)} className="p-2 rounded-xl glass hover:bg-slate-700">
                    <ArrowLeft size={18} className="text-slate-300" />
                </button>
                <h1 className="text-xl font-bold text-white">Create Your Farm Profile</h1>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Rajesh Kumar"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-card-dark)] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="e.g., 9876543210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-card-dark)] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                    />
                </div>

                {/* Village + District */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Village</label>
                        <input
                            type="text" placeholder="Village name"
                            value={form.village}
                            onChange={(e) => setForm({ ...form, village: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-card-dark)] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">District</label>
                        <input
                            type="text" placeholder="District name"
                            value={form.district}
                            onChange={(e) => setForm({ ...form, district: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-card-dark)] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* State */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">State</label>
                    <div className="flex flex-wrap gap-2">
                        {STATES.map((s) => (
                            <button
                                key={s}
                                onClick={() => setForm({ ...form, state: s })}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${form.state === s ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Crop */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Primary Crop</label>
                    <div className="flex flex-wrap gap-2">
                        {CROPS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setForm({ ...form, crop: c })}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${form.crop === c ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Farm Size */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Farm Size (acres)</label>
                    <input
                        type="number" placeholder="e.g., 3.5" step="0.5" min="0"
                        value={form.farmSize}
                        onChange={(e) => setForm({ ...form, farmSize: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-card-dark)] border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={handleFinish}
                className="w-full py-4 rounded-2xl gradient-primary text-white font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
            >
                <CheckCircle2 size={20} /> Start Your Journey
            </button>
        </div>
    );
}
