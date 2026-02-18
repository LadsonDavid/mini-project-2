import React, { useState, useEffect, useRef } from 'react';
import { Close as X } from '@mui/icons-material';

const EyeRelaxation = ({ onExit }) => {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);

    const config = {
        dotSize: 12,
        speed: 1.5,
        glowSize: 40,
        glowOpacity: 0.3,
        colors: ['#80cbc4', '#ffab91', '#ce93d8', '#90caf9', '#a5d6a7', '#fff59d']
    };

    const stateRef = useRef({
        x: 0,
        y: 0,
        vx: config.speed,
        vy: config.speed * 0.7,
        colorIndex: 0,
        animationId: null
    });

    const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const resize = (canvas) => {
        const container = canvas.parentElement;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        if (stateRef.current.x === 0 && stateRef.current.y === 0) {
            stateRef.current.x = width / 2;
            stateRef.current.y = height / 2;
        }
        return { width, height };
    };

    const update = (width, height) => {
        const s = stateRef.current;
        s.x += s.vx;
        s.y += s.vy;

        let bounced = false;

        if (s.x + config.dotSize > width || s.x - config.dotSize < 0) {
            s.vx *= -1;
            s.x = s.x < config.dotSize ? config.dotSize : width - config.dotSize;
            bounced = true;
        }

        if (s.y + config.dotSize > height || s.y - config.dotSize < 0) {
            s.vy *= -1;
            s.y = s.y < config.dotSize ? config.dotSize : height - config.dotSize;
            bounced = true;
        }

        if (bounced) {
            s.colorIndex = (s.colorIndex + 1) % config.colors.length;
        }
    };

    const draw = (ctx, width, height) => {
        const s = stateRef.current;
        const color = config.colors[s.colorIndex];

        ctx.fillStyle = '#0f1115';
        ctx.fillRect(0, 0, width, height);

        // Glow
        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, config.glowSize);
        gradient.addColorStop(0, hexToRgba(color, config.glowOpacity));
        gradient.addColorStop(1, 'rgba(15, 17, 21, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(s.x, s.y, config.glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, config.dotSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let { width, height } = resize(canvas);

        const animate = () => {
            update(width, height);
            draw(ctx, width, height);
            stateRef.current.animationId = requestAnimationFrame(animate);
        };

        if (isRunning) {
            stateRef.current.animationId = requestAnimationFrame(animate);
        } else {
            draw(ctx, width, height);
        }

        const handleResize = () => {
            const dim = resize(canvas);
            width = dim.width;
            height = dim.height;
            if (!isRunning) draw(ctx, width, height);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(stateRef.current.animationId);
        };
    }, [isRunning]);

    return (
        <div
            className="relative w-full h-[500px] bg-[#0f1115] rounded-none border border-[var(--border-subtle)] overflow-hidden cursor-pointer"
        >
            <div className="absolute top-6 left-0 right-0 flex items-center justify-center pointer-events-none z-20">
                <div className={`bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-[0.2em] transition-opacity duration-500`} style={{ opacity: isRunning ? 0 : 1 }}>
                    CLICK TO START TRACKING
                </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center pointer-events-none z-20">
                <div className="text-white/20 text-[10px] font-mono tracking-[0.4em] uppercase">
                    EYE RELAXATION MODE
                </div>
            </div>

            <div className="absolute top-4 right-4 z-30">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onExit();
                    }}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors pointer-events-auto"
                    title="Exit Game"
                >
                    <X className="w-5 h-5 text-red-500" />
                </button>
            </div>

            <canvas ref={canvasRef} className="block w-full h-full" onClick={() => setIsRunning(!isRunning)} />

        </div>
    );

};

export default EyeRelaxation;
