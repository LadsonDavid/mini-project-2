import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Close as X } from '@mui/icons-material';

const MemoryGlow = ({ onExit }) => {
    const [level, setLevel] = useState(1);
    const [masterSequence, setMasterSequence] = useState([]);
    const [userSequence, setUserSequence] = useState([]);
    const [status, setStatus] = useState({ msg: 'Press Start to Begin', type: 'default' });
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTile, setActiveTile] = useState(null);
    const audioCtxRef = useRef(null);

    const tileFrequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00];

    const playTone = useCallback((freq, duration) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration / 1000);
    }, []);

    const glowTile = useCallback((index, duration = 600) => {
        setActiveTile(index);
        playTone(tileFrequencies[index], duration);
        setTimeout(() => setActiveTile(null), duration);
    }, [playTone]);

    const playSequence = useCallback((sequence) => {
        setIsPlaying(true);
        setStatus({ msg: 'Watch carefully...', type: 'default' });

        sequence.forEach((tileIndex, i) => {
            setTimeout(() => {
                glowTile(tileIndex);
                if (i === sequence.length - 1) {
                    setTimeout(() => {
                        setIsPlaying(false);
                        setStatus({ msg: 'Your turn', type: 'default' });
                    }, 800);
                }
            }, (i + 1) * 1000);
        });
    }, [glowTile]);

    const startGame = () => {
        const firstTile = Math.floor(Math.random() * 6);
        const newSeq = [firstTile];
        setMasterSequence(newSeq);
        setUserSequence([]);
        setLevel(1);
        playSequence(newSeq);
    };

    const nextLevel = useCallback(() => {
        const nextTile = Math.floor(Math.random() * 6);
        const newSeq = [...masterSequence, nextTile];
        setMasterSequence(newSeq);
        setUserSequence([]);
        setLevel(prev => prev + 1);
        setTimeout(() => playSequence(newSeq), 1000);
    }, [masterSequence, playSequence]);

    const handleTileClick = (index) => {
        if (isPlaying || status.msg === 'Press Start to Begin') return;

        glowTile(index, 400);
        const newUserSequence = [...userSequence, index];
        setUserSequence(newUserSequence);

        if (index !== masterSequence[newUserSequence.length - 1]) {
            setStatus({ msg: "Not quite... let's try again.", type: 'error' });
            playTone(110.00, 600);
            setIsPlaying(true);
            setTimeout(() => {
                setUserSequence([]);
                playSequence(masterSequence);
            }, 1500);
            return;
        }

        if (newUserSequence.length === masterSequence.length) {
            setStatus({ msg: 'Well done!', type: 'success' });
            setIsPlaying(true);
            setTimeout(nextLevel, 1200);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#1a1c22] rounded-none border border-white/10 shadow-2xl min-h-[500px] w-full max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-6 left-0 right-0 flex flex-col items-center pointer-events-none z-20">
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-1">Current Progress</span>
                <div className="text-xl font-bold tracking-widest text-white uppercase mb-4">LEVEL {level}</div>

                <div className={`px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium transition-all ${status.type === 'error' ? 'text-red-400 border-red-400/20' :
                    status.type === 'success' ? 'text-green-400 border-green-400/20' : 'text-blue-400 border-blue-400/20'
                    }`}>
                    {status.msg}
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

            <div className="relative z-10 flex flex-col items-center pt-32">
                <div className="grid grid-cols-3 gap-6 mb-24">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            onClick={() => handleTileClick(i)}
                            className={`w-24 h-24 rounded-none cursor-pointer transition-all duration-400 transform hover:scale-105 active:scale-95 ${activeTile === i ? 'ring-4 ring-white shadow-[0_0_40px_rgba(255,255,255,0.6)] z-20' : 'opacity-70'
                                }`}
                            style={{
                                backgroundColor: ['#ffab91', '#ce93d8', '#90caf9', '#a5d6a7', '#fff59d', '#80cbc4'][i],
                                boxShadow: activeTile === i ? `0 0 50px ${['#ffab91', '#ce93d8', '#90caf9', '#a5d6a7', '#fff59d', '#80cbc4'][i]}` : 'none',
                                opacity: activeTile === i || !isPlaying ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>

                {status.msg === 'Press Start to Begin' && (
                    <button
                        onClick={startGame}
                        className="mt-12 px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-none hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm shadow-lg"
                    >
                        START SEQUENCE
                    </button>
                )}
            </div>


            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
        </div>
    );

};

export default MemoryGlow;
