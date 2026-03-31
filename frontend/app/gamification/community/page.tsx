'use client';

import { Heart, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react';

const DEMO_FEED = [
    {
        id: '1', farmer_name: 'Vijay Sharma', farmer_level: 5, type: 'quest_complete', time: '2 hours ago',
        content: { title: 'Completed "Install Drip Irrigation"', xp: 400, category: 'water' },
    },
    {
        id: '2', farmer_name: 'Anita Devi', farmer_level: 4, type: 'badge_earn', time: '5 hours ago',
        content: { badge_name: 'Water Warrior', badge_description: 'Saved 10,000L water via efficient irrigation' },
    },
    {
        id: '3', farmer_name: 'Rajesh Kumar', farmer_level: 3, type: 'photo_story', time: '1 day ago',
        content: { title: 'My composting journey!', description: 'Started a new compost pit last week. Already seeing the worms doing their magic! 🪱', images: ['placeholder'] },
    },
    {
        id: '4', farmer_name: 'Sunita Kumari', farmer_level: 2, type: 'level_up', time: '2 days ago',
        content: { new_level: 2, level_name: 'Sprout' },
    },
    {
        id: '5', farmer_name: 'Mahesh Singh', farmer_level: 3, type: 'shoutout', time: '2 days ago',
        content: { from_farmer_name: 'Ravi Verma', message: 'Thanks for helping me set up mulching! Great mentor! 🙏' },
    },
];

const TYPE_EMOJI: Record<string, string> = {
    quest_complete: '✅', badge_earn: '🏅', photo_story: '📸', level_up: '🎊', shoutout: '📣',
};

const TYPE_BG: Record<string, string> = {
    quest_complete: 'bg-green-500/10', badge_earn: 'bg-yellow-500/10', photo_story: 'bg-blue-500/10',
    level_up: 'bg-purple-500/10', shoutout: 'bg-cyan-500/10',
};

export default function CommunityPage() {
    return (
        <div className="space-y-6 animate-count-up">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Community</h1>
                <button className="px-3 py-1.5 rounded-xl bg-primary-500 text-xs text-white font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                    <ImageIcon size={14} /> Post Story
                </button>
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
                {DEMO_FEED.map((item) => (
                    <div key={item.id} className={`glass-card ${TYPE_BG[item.type] || ''}`}>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                                {item.farmer_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold text-white">{item.farmer_name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-primary-400">Lv.{item.farmer_level}</span>
                                    <span className="text-[10px] text-slate-500">{item.time}</span>
                                </div>
                            </div>
                            <span className="text-lg">{TYPE_EMOJI[item.type]}</span>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                            {item.type === 'quest_complete' && (
                                <div>
                                    <p className="text-sm text-slate-300">{(item.content as any).title}</p>
                                    <span className="text-xs text-xp-400 font-medium">+{(item.content as any).xp} XP</span>
                                </div>
                            )}
                            {item.type === 'badge_earn' && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                    {/* Placeholder for badge icon */}
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl">🏅</div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{(item.content as any).badge_name}</p>
                                        <p className="text-xs text-slate-400">{(item.content as any).badge_description}</p>
                                    </div>
                                </div>
                            )}
                            {item.type === 'photo_story' && (
                                <div>
                                    <p className="text-sm font-medium text-white mb-1">{(item.content as any).title}</p>
                                    <p className="text-xs text-slate-400 mb-3">{(item.content as any).description}</p>
                                    {/* Placeholder for story image */}
                                    <div className="w-full h-48 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                        <span className="text-slate-500 text-sm">📷 Photo placeholder</span>
                                    </div>
                                </div>
                            )}
                            {item.type === 'level_up' && (
                                <p className="text-sm text-slate-300">
                                    Leveled up to <span className="text-primary-400 font-semibold">Level {(item.content as any).new_level}</span> — <span className="text-primary-300">{(item.content as any).level_name}</span>! 🎉
                                </p>
                            )}
                            {item.type === 'shoutout' && (
                                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                    <p className="text-xs text-slate-400 mb-1">From <span className="text-cyan-300">{(item.content as any).from_farmer_name}</span></p>
                                    <p className="text-sm text-white">&ldquo;{(item.content as any).message}&rdquo;</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 pt-2 border-t border-slate-700/30">
                            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
                                <Heart size={14} /> Like
                            </button>
                            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors">
                                <MessageCircle size={14} /> Comment
                            </button>
                            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-green-400 transition-colors">
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
