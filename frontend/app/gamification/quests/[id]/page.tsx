'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Star, Upload, CheckCircle2, Circle, Camera } from 'lucide-react';
import { useQuestStore } from '@/store/questStore';

const CATEGORY_EMOJI: Record<string, string> = {
    water: '💧', soil: '🧪', organic: '🌿', biodiversity: '🦋',
    pest: '🐛', rotation: '🔄', energy: '⚡', community: '🤝',
};

const DEMO_STEPS = [
    { step: 1, action: 'Prepare materials and review instructions' },
    { step: 2, action: 'Implement the practice in your field' },
    { step: 3, action: 'Document progress with photos' },
    { step: 4, action: 'Upload proof and submit for review' },
];

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { quests, activeQuests, loadDemoData } = useQuestStore();
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (quests.length === 0) loadDemoData();
    }, [quests.length, loadDemoData]);

    const quest = quests.find((q) => q.id === params.id);
    const activeQuest = activeQuests.find((aq) => aq.quest.id === params.id);

    if (!quest) {
        return (
            <div className="text-center py-20">
                <span className="text-4xl mb-3 block">🔍</span>
                <p className="text-slate-400">Quest not found</p>
                <button onClick={() => router.back()} className="mt-4 text-primary-400 text-sm hover:underline">← Go back</button>
            </div>
        );
    }

    const isActive = !!activeQuest;
    const steps = DEMO_STEPS;

    const toggleStep = (stepNum: number) => {
        const next = new Set(completedSteps);
        next.has(stepNum) ? next.delete(stepNum) : next.add(stepNum);
        setCompletedSteps(next);
    };

    const progress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

    return (
        <div className="space-y-6 animate-count-up">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 rounded-xl glass hover:bg-slate-700 transition-colors">
                    <ArrowLeft size={18} className="text-slate-300" />
                </button>
                <h1 className="text-lg font-bold text-white flex-1">{quest.title}</h1>
            </div>

            {/* Hero Banner */}
            <div className="glass-card relative overflow-hidden">
                {/* Placeholder for quest illustration */}
                <div className="absolute top-0 right-0 w-40 h-40 opacity-10 text-8xl">{CATEGORY_EMOJI[quest.category]}</div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl">{CATEGORY_EMOJI[quest.category]}</span>
                        <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-500/20 text-primary-300 capitalize">{quest.category}</span>
                            <span className="px-2 py-0.5 ml-2 rounded-full text-[10px] font-medium bg-slate-700/50 text-slate-300 capitalize">{quest.quest_type}</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{quest.title}</h2>
                    <p className="text-sm text-slate-400 mb-4">{quest.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Star size={14} className="text-amber-400" /> {quest.difficulty}/5</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {quest.duration_days} days</span>
                        <span className="text-xp-400 font-bold text-sm">+{quest.xp_reward} XP</span>
                    </div>
                </div>
            </div>

            {/* Progress (if active) */}
            {isActive && (
                <div className="glass-card">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-primary-400 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full">
                        <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* Steps Checklist */}
            <div className="glass-card">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Quest Steps</h3>
                <div className="space-y-3">
                    {steps.map((step) => {
                        const done = completedSteps.has(step.step);
                        return (
                            <button
                                key={step.step}
                                onClick={() => toggleStep(step.step)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${done ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-slate-800/50 hover:bg-slate-700/50'
                                    }`}
                            >
                                {done ? (
                                    <CheckCircle2 size={20} className="text-primary-400 mt-0.5 shrink-0" />
                                ) : (
                                    <Circle size={20} className="text-slate-600 mt-0.5 shrink-0" />
                                )}
                                <div>
                                    <span className={`text-[10px] font-medium ${done ? 'text-primary-400' : 'text-slate-500'}`}>
                                        Step {step.step}
                                    </span>
                                    <p className={`text-sm ${done ? 'text-slate-300 line-through' : 'text-white'}`}>
                                        {step.action}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Upload Proof */}
            <div className="glass-card border border-dashed border-slate-600">
                <div className="flex flex-col items-center gap-3 py-4">
                    {/* Placeholder for ProofUploader component */}
                    <div className="p-3 rounded-full bg-slate-700/50">
                        <Camera size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400">Upload proof photo</p>
                    <button className="px-4 py-2 rounded-xl bg-slate-700 text-xs text-white hover:bg-slate-600 transition-colors flex items-center gap-2">
                        <Upload size={14} />
                        Choose from Gallery
                    </button>
                </div>
            </div>

            {/* Action Button */}
            <button
                className={`w-full py-4 rounded-2xl text-white font-semibold text-base transition-all ${isActive
                        ? progress === 100
                            ? 'gradient-primary shadow-lg shadow-primary-500/25 hover:opacity-90'
                            : 'bg-slate-700 cursor-not-allowed opacity-50'
                        : 'gradient-primary shadow-lg shadow-primary-500/25 hover:opacity-90'
                    }`}
            >
                {isActive ? (progress === 100 ? 'Submit Quest ✓' : `Complete all steps (${completedSteps.size}/${steps.length})`) : 'Accept Quest →'}
            </button>
        </div>
    );
}
