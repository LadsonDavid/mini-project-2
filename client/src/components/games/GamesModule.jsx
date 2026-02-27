import React, { useState } from 'react';
import { Air as Wind, Adjust as CircleDot, Visibility as Eye, Psychology as BrainIcon, ChevronRight } from '@mui/icons-material';
import BreathSync from './BreathSync';
import BubbleBurst from './BubbleBurst';
import EyeRelaxation from './EyeRelaxation';
import MemoryGlow from './MemoryGlow';

const GamesModule = () => {
    const [activeGame, setActiveGame] = useState(null);

    const games = [
        { id: 'breath', name: 'Breath Sync', icon: Wind, component: BreathSync, description: 'Guided breathing for stress relief' },
        { id: 'bubble', name: 'Bubble Burst', icon: CircleDot, component: BubbleBurst, description: 'Satisfying pops for immediate calm' },
        { id: 'eye', name: 'Eye Relaxation', icon: Eye, component: EyeRelaxation, description: 'Visual tracking for eye strain relief' },
        { id: 'memory', name: 'Memory Glow', icon: BrainIcon, component: MemoryGlow, description: 'Gentle sequence training for focus' },
    ];

    const handleBack = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setActiveGame(null);
    };

    const handleSelectGame = (gameId) => {
        setActiveGame(gameId);
        // Automatically enter full screen when a game is selected
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Full-screen request failed: ${err.message}`);
            });
        }
    };

    const SelectedGame = games.find(g => g.id === activeGame)?.component;

    return (
        <div className="flex flex-col gap-6">
            {!activeGame ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
                    {games.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => handleSelectGame(game.id)}
                            className="group p-8 bg-[var(--color-card)] border border-[var(--border-subtle)] rounded-none hover:border-[var(--color-primary)] transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
                        >
                            <div className="w-16 h-16 rounded-none bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <game.icon className="w-8 h-8 text-[var(--color-primary)]" />
                            </div>

                            <h3 className="font-bold text-xl text-[var(--text-primary)] mb-3">
                                {game.name}
                            </h3>
                            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mx-auto max-w-[200px]">
                                {game.description}
                            </p>
                        </button>

                    ))}
                </div>
            ) : (
                <div className="animate-fade-in fixed inset-0 z-[100] bg-[var(--color-bg)] flex flex-col overflow-hidden">
                    {/* Floating Header */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[110] pointer-events-none">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 bg-white/5 rounded-none border border-white/10 pointer-events-auto backdrop-blur-md"
                        >
                            ← Exit & Dashboard
                        </button>
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-none border border-white/10 backdrop-blur-md">
                            <div className="p-1 rounded-none bg-[var(--color-primary)]/10">
                                {React.createElement(games.find(g => g.id === activeGame).icon, { className: "w-4 h-4 text-[var(--color-primary)]" })}
                            </div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">
                                {games.find(g => g.id === activeGame).name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="w-full max-w-4xl animate-zoom-in">
                            {SelectedGame && <SelectedGame onExit={handleBack} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default GamesModule;
