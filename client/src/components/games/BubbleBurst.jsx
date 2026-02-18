import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Close as X } from '@mui/icons-material';

const BubbleBurst = ({ onExit }) => {
    const [bubbles, setBubbles] = useState([]);
    const [particles, setParticles] = useState([]);
    const containerRef = useRef(null);
    const audioCtxRef = useRef(null);

    const colors = [
        'rgba(52, 152, 219, 0.8)', // Stronger Blue
        'rgba(46, 204, 113, 0.8)', // Stronger Green
        'rgba(231, 76, 60, 0.7)',  // Soft Red
        'rgba(155, 89, 182, 0.8)', // Stronger Purple
        'rgba(241, 196, 15, 0.8)', // Stronger Yellow
        'rgba(230, 126, 34, 0.8)'  // Stronger Orange
    ];

    const playSound = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const audioCtx = audioCtxRef.current;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const baseFreq = 400 + Math.random() * 200;

        const oscBubble = audioCtx.createOscillator();
        const gainBubble = audioCtx.createGain();
        oscBubble.type = 'sine';
        oscBubble.frequency.setValueAtTime(baseFreq, now);
        oscBubble.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.1);
        gainBubble.gain.setValueAtTime(0, now);
        gainBubble.gain.linearRampToValueAtTime(0.15, now + 0.01);
        gainBubble.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        const oscPing = audioCtx.createOscillator();
        const gainPing = audioCtx.createGain();
        oscPing.type = 'triangle';
        oscPing.frequency.setValueAtTime(baseFreq * 2.5, now);
        gainPing.gain.setValueAtTime(0, now);
        gainPing.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        oscBubble.connect(gainBubble);
        gainBubble.connect(audioCtx.destination);
        oscPing.connect(gainPing);
        gainPing.connect(audioCtx.destination);

        oscBubble.start(now);
        oscBubble.stop(now + 0.2);
        oscPing.start(now);
        oscPing.stop(now + 0.15);
    }, []);

    const createBurst = useCallback((x, y, color) => {
        const newParticles = [];
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
            const velocity = 50 + Math.random() * 50;
            newParticles.push({
                id: Date.now() + i,
                x,
                y,
                tx: Math.cos(angle) * velocity,
                ty: Math.sin(angle) * velocity,
                color
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 600);
    }, []);

    const popBubble = useCallback((id, x, y, color) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        playSound();
        createBurst(x, y, color);
    }, [playSound, createBurst]);

    const spawnBubble = useCallback(() => {
        if (!containerRef.current) return;
        const { offsetWidth, offsetHeight } = containerRef.current;
        const size = Math.floor(Math.random() * 60) + 60;
        const color = colors[Math.floor(Math.random() * colors.length)];

        const newBubble = {
            id: Date.now(),
            x: Math.random() * (offsetWidth - size),
            y: Math.random() * (offsetHeight - size),
            size,
            color
        };

        setBubbles(prev => {
            const updated = [...prev, newBubble];
            return updated.slice(-20); // Limit to 20 bubbles
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(spawnBubble, 1500);
        return () => clearInterval(interval);
    }, [spawnBubble]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[500px] bg-[#0f1115] rounded-none border border-[var(--border-subtle)] overflow-hidden cursor-crosshair flex flex-col"
        >
            <div className="absolute top-6 left-0 right-0 flex items-center justify-center pointer-events-none z-20">
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                    TAP THE BUBBLES TO RELAX
                </div>
            </div>

            <div className="absolute top-4 right-4 z-30">
                <button
                    onClick={onExit}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors pointer-events-auto"
                    title="Exit Game"
                >
                    <X className="w-5 h-5 text-red-500" />
                </button>
            </div>


            {bubbles.map(bubble => (
                <div
                    key={bubble.id}
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const x = rect.left - containerRect.left + bubble.size / 2;
                        const y = rect.top - containerRect.top + bubble.size / 2;
                        popBubble(bubble.id, x, y, bubble.color);
                    }}
                    className="absolute rounded-full cursor-pointer animate-pop-in"
                    style={{
                        left: bubble.x,
                        top: bubble.y,
                        width: bubble.size,
                        height: bubble.size,
                        background: bubble.color,
                        border: `2px solid ${bubble.color.replace('0.7', '0.9').replace('0.8', '1.0')}`,
                        boxShadow: `0 0 20px ${bubble.color}`,
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                />
            ))}

            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none animate-particle"
                    style={{
                        left: p.x,
                        top: p.y,
                        background: p.color,
                        '--tx': `${p.tx}px`,
                        '--ty': `${p.ty}px`
                    }}
                />
            ))}

            <style jsx>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-particle { animation: particle 0.6s ease-out forwards; }
      `}</style>
        </div>
    );
};

export default BubbleBurst;
