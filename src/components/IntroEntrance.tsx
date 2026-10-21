import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, ArrowRight, Radio, Disc, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../assets/images';

interface IntroEntranceProps {
  onEnter: () => void;
  siteName?: string;
  tagline?: string;
}

export const IntroEntrance: React.FC<IntroEntranceProps> = ({
  onEnter,
  siteName = 'MY WORLD',
  tagline = 'CURATED UNDERGROUND RAP & SONIC VAULT',
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [timecode, setTimecode] = useState('00:00:00:00');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Timecode generator for underground studio / music video reel look
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ms = Math.floor((elapsed % 1000) / 10).toString().padStart(2, '0');
      const sec = Math.floor((elapsed / 1000) % 60).toString().padStart(2, '0');
      const min = Math.floor((elapsed / (1000 * 60)) % 60).toString().padStart(2, '0');
      const hrs = Math.floor(elapsed / (1000 * 60 * 60)).toString().padStart(2, '0');
      setTimecode(`${hrs}:${min}:${sec}:${ms}`);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Ensure video tries to play muted
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setVideoLoaded(true);
      }).catch(() => {
        // Fallback to stylized poster background if browser blocks video
        setVideoFailed(true);
      });
    }
  }, []);

  // Web Audio API: Ambient Underground Sub-Bass Drone when user toggles sound ON
  const startAmbientAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 55Hz (A1) + 40Hz sub-bass analog drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(36.7, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      ambientOscRef.current = { osc1, osc2, gain };
      setAudioEnabled(true);
    } catch (err) {
      console.warn('Web Audio Ambient failed:', err);
    }
  };

  const stopAmbientAudio = () => {
    if (ambientOscRef.current && audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current;
        ambientOscRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        setTimeout(() => {
          ambientOscRef.current?.osc1.stop();
          ambientOscRef.current?.osc2.stop();
          ambientOscRef.current = null;
        }, 350);
      } catch {}
    }
    setAudioEnabled(false);
  };

  const toggleSound = () => {
    if (audioEnabled) {
      stopAmbientAudio();
    } else {
      startAmbientAudio();
    }
  };

  // Web Audio API: Cinematic Bass Drop & Impact on START Click
  const playCinematicDrop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Heavy 808 Sub-bass drop: 130Hz -> 32Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.7);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);

      // Noise impact layer (tape snap)
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (err) {
      console.warn('Cinematic audio impact skipped:', err);
    }
  };

  // Handle START Button Click with Transition
  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    playCinematicDrop();

    // Fade out ambient tone cleanly
    if (ambientOscRef.current && audioCtxRef.current) {
      try {
        ambientOscRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
      } catch {}
    }

    // Trigger onEnter after cinematic zoom and flash
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
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-[#F5F5F5] select-none overflow-hidden transition-all duration-700 ease-out ${
        isStarting ? 'animate-glitch-exit pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {/* ========================================================
          1. FULL-SCREEN BACKGROUND VIDEO & FALLBACKS
      ======================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#050505]">
        {/* Full-screen looping video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={ASSET_IMAGES.moodboardNight || ASSET_IMAGES.heroVinyl}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-[0.6] transition-opacity duration-1000 ${
            videoLoaded && !videoFailed ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <source
            src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cd/City_at_night.webm/City_at_night.webm.720p.vp9.webm"
            type="video/webm"
          />
          <source
            src="https://upload.wikimedia.org/wikipedia/commons/c/cd/City_at_night.webm"
            type="video/webm"
          />
        </video>

        {/* Fallback & Poster layer (high-contrast street & city texture) */}
        <div
          className={`absolute inset-0 bg-cover bg-center filter contrast-125 brightness-[0.55] transition-opacity duration-1000 ${
            videoLoaded && !videoFailed ? 'opacity-0' : 'opacity-80'
          }`}
          style={{
            backgroundImage: `url(${ASSET_IMAGES.moodboardNight || ASSET_IMAGES.heroVinyl})`,
          }}
        />

        {/* Underground Cinematic Smoke & Red Neon Ambient Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top-down dramatic street light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[45vh] bg-gradient-to-b from-red-950/20 via-zinc-900/10 to-transparent blur-3xl" />
          
          {/* Center red glowing core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-ambient-pulse" />

          {/* Heavy Vignette & Radial Edge Shadows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_80%,#000000_100%)]" />

          {/* Film Grain & CRT Scanline Grid Texture */}
          <div 
            className="absolute inset-0 opacity-[0.22] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 2px)',
              backgroundSize: '100% 2px',
            }}
          />
        </div>
      </div>

      {/* ========================================================
          2. CORNER HUD, RAP BADGES & CONTROLS
      ======================================================== */}
      {/* Top Left: [REC] Indicator & Live Timecode */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 font-mono text-[11px] text-[#A1A1A1]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-blink-rec shadow-[0_0_10px_#EF4444]" />
          <span className="font-bold tracking-widest text-[#F5F5F5] uppercase">REC</span>
          <span className="text-[#606060]">·</span>
          <span className="tracking-widest text-red-400 font-semibold">{timecode}</span>
        </div>
        <div className="text-[10px] tracking-[0.25em] text-[#707070] uppercase">
          TAPE // SESSION 001 · PROD. MASTER
        </div>
      </div>

      {/* Top Right: Sound Toggle & Skip Option */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Minimal sound toggle */}
        <button
          onClick={toggleSound}
          className="group flex items-center gap-2 px-3 py-1.5 bg-[#0D0D0D]/85 hover:bg-[#181818] border border-[#2B2B2B] hover:border-red-500/60 text-[11px] uppercase tracking-wider text-[#C0C0C0] hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-lg"
          title={audioEnabled ? "Turn audio off" : "Enable atmospheric underground sound"}
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <div className="flex items-end gap-0.5 h-3 w-3">
                <span className="w-0.5 bg-red-500 bar-anim-1 h-full" />
                <span className="w-0.5 bg-red-500 bar-anim-2 h-full" />
                <span className="w-0.5 bg-red-500 bar-anim-3 h-full" />
              </div>
              <span className="font-mono text-[10px] text-red-400">AUDIO: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#707070] group-hover:text-white transition-colors" />
              <span className="font-mono text-[10px] text-[#808080] group-hover:text-[#F5F5F5]">AUDIO: OFF</span>
            </>
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={onEnter}
          className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[#707070] hover:text-white transition-colors cursor-pointer font-mono"
        >
          SKIP [ESC]
        </button>
      </div>

      {/* Bottom Left: Authentic Parental Advisory Stamp */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex flex-col gap-2">
        <div className="border border-[#F5F5F5] bg-black/90 px-3 py-1.5 text-center shadow-xl">
          <div className="text-[10px] font-black tracking-[0.25em] text-[#F5F5F5] uppercase leading-none">
            PARENTAL
          </div>
          <div className="text-[13px] font-black tracking-[0.35em] text-[#F5F5F5] uppercase border-y border-[#F5F5F5]/60 my-0.5 py-0.5 leading-none">
            ADVISORY
          </div>
          <div className="text-[8px] font-bold tracking-[0.2em] text-[#A1A1A1] uppercase leading-none">
            EXPLICIT SOUND
          </div>
        </div>
        <div className="text-[9px] font-mono tracking-widest text-[#666666] uppercase">
          48 kHz · 24-BIT MASTER AUDIO
        </div>
      </div>

      {/* Bottom Right: Coordinates & System status */}
      <div className="absolute bottom-6 right-6 z-20 hidden sm:flex flex-col items-end gap-1 font-mono text-[10px] text-[#707070] tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-[#A1A1A1]">VAULT STATUS: ACTIVE</span>
        </div>
        <div>NEW YORK · LONDON · BERLIN · CAIRO</div>
      </div>

      {/* ========================================================
          3. CENTER "START" EXPERIENCE (THE CLEAR FOCAL POINT)
      ======================================================== */}
      <div className="relative z-10 max-w-2xl w-full mx-6 flex flex-col items-center text-center space-y-7">
        
        {/* Subtitle above button */}
        <div className="flex items-center gap-3">
          <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-red-500" />
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.35em] sm:tracking-[0.45em] text-red-500 uppercase drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
            WELCOME TO THE UNDERGROUND
          </span>
          <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-red-500" />
        </div>

        {/* Big Rap Brand Title */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#F5F5F5] leading-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
            {siteName}
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-[#A1A1A1] font-light max-w-md mx-auto">
            {tagline}
          </p>
        </div>

        {/* The START Button Experience */}
        <div className="pt-4 flex flex-col items-center space-y-4">
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="group relative cursor-pointer outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-black transition-transform duration-300 active:scale-95 hover:scale-105"
          >
            {/* Outer pulsating red neon bloom */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-none opacity-75 blur-md group-hover:opacity-100 group-hover:blur-lg transition duration-500 animate-neon-pulse" />

            {/* Inner Button Core */}
            <div className="relative px-12 sm:px-16 py-5 sm:py-6 bg-[#080808] border-2 border-red-500/90 group-hover:border-white text-white flex items-center justify-center gap-4 transition-all duration-300 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              {/* Play triangle accent */}
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_15px_#EF4444] group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>

              {/* Bold Condensed Typography */}
              <span className="text-2xl sm:text-3xl font-black uppercase tracking-[0.25em] text-[#F5F5F5] group-hover:text-white group-hover:tracking-[0.3em] transition-all duration-300">
                START
              </span>

              {/* Arrow transition indicator */}
              <ArrowRight className="w-5 h-5 text-red-500 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
            </div>
          </button>

          {/* Interactive Keyboard / Action Cue */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#707070] uppercase pt-1">
            <span>[ PRESS</span>
            <kbd className="px-1.5 py-0.5 bg-[#141414] border border-[#2B2B2B] text-zinc-300 text-[9px] rounded-none">
              ENTER
            </kbd>
            <span>OR</span>
            <kbd className="px-1.5 py-0.5 bg-[#141414] border border-[#2B2B2B] text-zinc-300 text-[9px] rounded-none">
              SPACE
            </kbd>
            <span>TO ENTER ]</span>
          </div>
        </div>

        {/* Minimal bottom equalizer bars animation */}
        <div className="pt-2 flex items-center justify-center gap-1 opacity-70">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className={`w-0.5 bg-gradient-to-t from-red-600 to-white/80 transition-all ${
                i % 4 === 0 ? 'bar-anim-1' : i % 4 === 1 ? 'bar-anim-2' : i % 4 === 2 ? 'bar-anim-3' : 'bar-anim-4'
              }`}
              style={{
                height: `${12 + ((i * 7) % 24)}px`,
                animationDelay: `${(i * 0.08).toFixed(2)}s`,
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
