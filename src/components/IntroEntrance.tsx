import React, { useState, useEffect, useRef } from 'react';
import { Play, ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface IntroEntranceProps {
  onEnter: () => void;
  siteName?: string;
  tagline?: string;
}

export const IntroEntrance: React.FC<IntroEntranceProps> = ({
  onEnter,
  siteName = 'MY WORLD',
  tagline = 'CLICK OR PRESS ENTER TO ENTER',
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio API: Cinematic 808 Sub-Bass Impact & Whoosh on Click
  const playCinematicDrop = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Heavy 808 Sub-bass drop: 150Hz -> 30Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.65);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.7);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);

      // High-frequency cinematic warp whoosh
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Trigger START and transition smoothly to the website
  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    playCinematicDrop();

    // After cinematic zoom and animation (650ms), enter main website
    setTimeout(() => {
      onEnter();
    }, 650);
  };

  // Keyboard accessibility: Enter or Space triggers START
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      } else if (e.key === 'Escape') {
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarting]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-[#F5F5F5] select-none overflow-hidden transition-all duration-700 ease-out ${
        isStarting ? 'animate-warp-exit pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {/* PURE BLACK CANVAS - Completely dark background */}
      <div className="absolute inset-0 bg-[#000000] pointer-events-none" />

      {/* Subtle, restrained ambient red glow centered behind START */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-ambient-pulse" />

      {/* Minimal corner indicators */}
      {/* Top Left: Clean brand mark */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 font-mono text-[11px] text-[#666666] uppercase tracking-[0.25em]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ambient-pulse" />
        <span>{siteName}</span>
      </div>

      {/* Top Right: Sound & Skip */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playCinematicDrop();
          }}
          className="group flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#141414] border border-[#222222] hover:border-red-500/60 text-[10px] uppercase tracking-wider text-[#777777] hover:text-white transition-all cursor-pointer font-mono"
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-400">SOUND: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#555555] group-hover:text-white" />
              <span>SOUND: OFF</span>
            </>
          )}
        </button>

        <button
          onClick={onEnter}
          className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[#555555] hover:text-white transition-colors cursor-pointer font-mono"
          title="Skip intro directly"
        >
          SKIP [ESC]
        </button>
      </div>

      {/* ========================================================
          CENTER "START" EXPERIENCE & CINEMATIC ANIMATION
      ======================================================== */}
      <div className="relative z-10 max-w-xl w-full mx-6 flex flex-col items-center text-center space-y-8">
        
        {/* Subtle top indicator */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-500" />
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.35em] text-red-500 uppercase drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
            WELCOME TO THE UNDERGROUND
          </span>
          <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-500" />
        </div>

        {/* Central Brand Title */}
        <div className="space-y-1">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-[0.2em] text-[#F5F5F5] leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
            {siteName}
          </h1>
        </div>

        {/* The START Button Container */}
        <div className="relative pt-2 flex flex-col items-center space-y-5">
          {/* Shockwave expanding ring when clicked */}
          {isStarting && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500 rounded-none pointer-events-none animate-shockwave" />
          )}

          <button
            onClick={handleStart}
            disabled={isStarting}
            className="group relative cursor-pointer outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-black transition-all duration-300 active:scale-95 hover:scale-105"
          >
            {/* Outer pulsating neon bloom */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 opacity-60 blur-md group-hover:opacity-100 group-hover:blur-lg transition duration-500 animate-neon-pulse" />

            {/* Main Button Body: Pure Black Core with High-End Red/White Accent */}
            <div className="relative px-12 sm:px-18 py-5 sm:py-7 bg-[#050505] border-2 border-red-500/90 group-hover:border-white text-white flex items-center justify-center gap-5 transition-all duration-300 shadow-[0_0_35px_rgba(239,68,68,0.4)]">
              {/* Play triangle badge */}
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_15px_#EF4444] group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Bold Condensed Typography */}
              <span className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.3em] text-[#F5F5F5] group-hover:text-white transition-all duration-300">
                START
              </span>

              {/* Arrow indicator */}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
            </div>
          </button>

          {/* Interactive Keyboard / Action Cue */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#666666] uppercase pt-2">
            <span>[ PRESS</span>
            <kbd className="px-1.5 py-0.5 bg-[#111111] border border-[#2B2B2B] text-zinc-300 text-[9px]">
              ENTER
            </kbd>
            <span>OR CLICK TO ENTER ]</span>
          </div>
        </div>

        {/* Bottom Coordinates & Status */}
        <div className="pt-8 flex items-center justify-center gap-4 text-[10px] font-mono tracking-[0.25em] text-[#555555] uppercase">
          <span>CURATED RAP VAULT</span>
          <span>·</span>
          <span>HIGH-FIDELITY AUDIO</span>
        </div>

      </div>
    </div>
  );
};
