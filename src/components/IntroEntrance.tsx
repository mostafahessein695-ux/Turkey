import React, { useState, useEffect } from 'react';
import { Disc, Play, ArrowRight, Sparkles, Volume2, FastForward } from 'lucide-react';

interface IntroEntranceProps {
  onEnter: () => void;
  siteName?: string;
  tagline?: string;
}

export const IntroEntrance: React.FC<IntroEntranceProps> = ({
  onEnter,
  siteName = 'MY WORLD',
  tagline = 'A SENSORY SANCTUARY & SOUND ARCHIVE',
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'booting' | 'synced' | 'ready'>('booting');

  // Handle immediate entry with smooth fade out
  const handleTriggerEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 600); // Wait for transition duration
  };

  // Keyboard shortcut (Space, Enter, Esc) to skip/enter immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTriggerEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth lightweight progress counter up to 100%
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2600; // 2.6 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentPct);

      if (currentPct > 35 && currentPct <= 75) {
        setStage('synced');
      } else if (currentPct > 75) {
        setStage('ready');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        handleTriggerEnter();
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#030303] text-[#F5F5F5] select-none overflow-hidden transition-all duration-700 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Ambient background light gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-zinc-800/10 to-transparent rounded-full blur-3xl opacity-50 animate-ambient-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Top bar controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-[#707070] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ambient-pulse inline-block" />
          <span>FREQ: 432 Hz · LIVE ARCHIVE</span>
        </div>

        <button
          onClick={handleTriggerEnter}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#242424] hover:border-white text-[11px] uppercase tracking-widest text-[#A1A1A1] hover:text-white transition-all cursor-pointer bg-[#0A0A0A]/80 backdrop-blur-sm"
          title="Skip intro (Press Esc)"
        >
          <span>تخطي / Skip</span>
          <FastForward className="w-3 h-3 text-[#707070]" />
        </button>
      </div>

      {/* Center Cinematic Card */}
      <div className="relative z-10 max-w-lg w-full mx-6 flex flex-col items-center text-center space-y-8">
        
        {/* Animated Vinyl Core */}
        <div className="relative group cursor-pointer" onClick={handleTriggerEnter}>
          {/* Subtle outer glow ring */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-white/10 via-amber-400/5 to-transparent blur-md animate-ambient-pulse pointer-events-none" />

          {/* Vinyl Record disc */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#111111] via-[#1a1a1a] to-[#0a0a0a] border-4 border-[#222222] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center relative animate-spin-vinyl overflow-hidden">
            {/* Concentric sound grooves */}
            <div className="absolute inset-2 rounded-full border border-zinc-800/60 pointer-events-none" />
            <div className="absolute inset-5 rounded-full border border-zinc-700/40 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-zinc-800/60 pointer-events-none" />
            <div className="absolute inset-11 rounded-full border border-zinc-700/30 pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-zinc-800/40 pointer-events-none" />

            {/* Vinyl Sheen reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />

            {/* Vinyl Center Label */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E5E5E5] text-[#050505] flex flex-col items-center justify-center p-1 text-center shadow-inner relative z-10">
              <span className="text-[7px] font-black uppercase tracking-widest leading-none">
                MY WORLD
              </span>
              <div className="w-4 h-4 rounded-full bg-[#050505] my-1 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="text-[6px] tracking-widest font-mono text-zinc-600 leading-none">
                33⅓ RPM
              </span>
            </div>
          </div>

          {/* Tonearm / Stylus indicator */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shadow-lg">
            <Volume2 className="w-3.5 h-3.5 text-white/80" />
          </div>
        </div>

        {/* Audio Frequency Equalizer Bar Simulation */}
        <div className="flex items-center justify-center gap-1 h-6 px-4">
          <div className="w-1 h-3 bg-zinc-600 rounded-full bar-anim-1" />
          <div className="w-1 h-5 bg-white/90 rounded-full bar-anim-2" />
          <div className="w-1 h-4 bg-zinc-400 rounded-full bar-anim-3" />
          <div className="w-1 h-6 bg-white rounded-full bar-anim-4" />
          <div className="w-1 h-2 bg-zinc-600 rounded-full bar-anim-1" />
          <div className="w-1 h-5 bg-white/80 rounded-full bar-anim-3" />
          <div className="w-1 h-3 bg-zinc-500 rounded-full bar-anim-2" />
          <div className="w-1 h-6 bg-white rounded-full bar-anim-4" />
          <div className="w-1 h-4 bg-zinc-400 rounded-full bar-anim-2" />
          <div className="w-1 h-2 bg-zinc-600 rounded-full bar-anim-1" />
        </div>

        {/* Cinematic Title & Typography */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#242424] bg-[#0A0A0A] text-[10px] uppercase tracking-[0.25em] text-[#A1A1A1] font-mono">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>PERSONAL MUSIC & LIFESTYLE ARCHIVE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.2em] text-[#F5F5F5] uppercase leading-none">
            {siteName}
          </h1>

          <p className="text-xs sm:text-sm tracking-[0.25em] text-[#707070] uppercase font-light max-w-sm mx-auto">
            {tagline}
          </p>
        </div>

        {/* Interactive Enter CTA and Progress Gauge */}
        <div className="w-full max-w-xs space-y-4">
          {/* Main Action Button */}
          <button
            onClick={handleTriggerEnter}
            className="w-full group flex items-center justify-center gap-3 py-3.5 px-6 bg-[#F5F5F5] hover:bg-white text-[#050505] text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-[0.98]"
          >
            <span>دخول الموقع / ENTER ARCHIVE</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-zinc-500 via-white to-amber-200 transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#555555]">
              <span>
                {stage === 'booting' && 'INITIALIZING ARCHIVE...'}
                {stage === 'synced' && 'TUNING SOUNDSTAGE...'}
                {stage === 'ready' && 'READY · PRESS ENTER'}
              </span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom subtle copyright / edition */}
      <div className="absolute bottom-6 left-6 right-6 text-center z-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#404040] font-mono">
          DESIGNED FOR SOUND PURISTS · {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
};
