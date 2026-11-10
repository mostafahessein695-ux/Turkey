import React from 'react';
import { SiteSettings } from '../types';
import { ShieldCheck, Sparkles, Ruler, RefreshCw, Feather, Layers } from 'lucide-react';

interface AboutPageProps {
  settings: SiteSettings;
  onExploreShop: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onExploreShop }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-28 sm:py-36 space-y-20">
      {/* Header */}
      <div className="space-y-4 max-w-3xl text-center sm:text-left">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#888888] font-mono block">
          Garment Studio &bull; Design Philosophy
        </span>
        <h1 className="text-3xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
          BUILT DIFFERENT.<br />WORN DIFFERENT.
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed font-light max-w-xl">
          TURVEX was founded as a rebellion against disposable fast-fashion and lightweight blends. We engineer heavyweight architectural garments made to live in.
        </p>
      </div>

      {/* Main Split: Atelier Photo and Manifesto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Visual Showcase */}
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-[#0A0A0A] border border-white/15 rounded-3xl overflow-hidden sticky top-28 shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85"
              alt="TURVEX Studio Atelier"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#CCCCCC] block">
                Garment Laboratory
              </span>
              <p className="text-sm font-bold uppercase text-white mt-0.5">
                480 GSM French Terry Cotton Archive
              </p>
            </div>
          </div>
        </div>

        {/* Brand Story Prose */}
        <div className="lg:col-span-7 space-y-8">
          <div className="liquid-glass-card rounded-3xl p-8 sm:p-12 border border-white/10 space-y-6">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#707070]">
              The TURVEX Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              A Study in Weight, Drape &amp; Longevity
            </h2>
            <div className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed space-y-4 font-light">
              <p>
                Every silhouette begins with the yarn. Most commercial streetwear brands use 240–320 GSM cotton that loses its structure after two laundry cycles. At TURVEX, our baseline starts at <strong>460 to 520 GSM</strong>.
              </p>
              <p>
                We spin tightly twisted long-staple organic cotton in custom loopback and French terry weaves. The result is a garment that does not cling to the body, but rather stands as an architectural shell—creating the coveted relaxed boxy drape.
              </p>
              <p>
                No excess plastic packaging. No decorative drawstrings that snag. Clean, concealed side seams, reinforced rib collars, and metal hardware built to outlast seasons.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-6 text-xs font-mono text-[#888888]">
              <div>
                <span className="text-white font-bold block text-base">480 GSM</span>
                <span>Signature Knit Density</span>
              </div>
              <div>
                <span className="text-white font-bold block text-base">100%</span>
                <span>Organic Combed Cotton</span>
              </div>
              <div>
                <span className="text-white font-bold block text-base">0%</span>
                <span>Synthetic Fillers</span>
              </div>
            </div>
          </div>

          {/* Core Engineering Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="liquid-glass-card p-6 rounded-2xl border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Heavyweight Knits
              </h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                480 GSM French Terry that provides substantial drape, natural warmth, and unmatched durability.
              </p>
            </div>

            <div className="liquid-glass-card p-6 rounded-2xl border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Ruler className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Anatomical Boxy Cut
              </h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Dropped shoulders, relaxed chest circumference, and a slightly cropped hem that layers effortlessly.
              </p>
            </div>

            <div className="liquid-glass-card p-6 rounded-2xl border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Enzyme Pre-Shrunk
              </h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Treated with stone enzyme wash so your garment preserves exact fit and softness wash after wash.
              </p>
            </div>

            <div className="liquid-glass-card p-6 rounded-2xl border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Ethical Small-Batch
              </h3>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Produced in limited capsule drops to eliminate warehouse waste and preserve artisanal hand-finishing.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onExploreShop}
              className="px-8 py-3.5 bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-widest rounded-2xl inline-flex items-center gap-2 transition-all shadow-xl cursor-pointer"
            >
              <span>Explore The Current Collection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
