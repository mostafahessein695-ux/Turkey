import React from 'react';
import { SiteSettings } from '../types';
import { ExternalLink, Disc, Headphones, Cpu, Radio, Sparkles } from 'lucide-react';

interface AboutPageProps {
  settings: SiteSettings;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#707070]">
          Manifesto & Background
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
          About MY WORLD
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed font-light">
          A personal universe dedicated to uncompromising sound, underground record culture, brutalist architecture, and sensory discernment.
        </p>
      </div>

      {/* Main split: Portrait and Manifesto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Photo */}
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-[#111111] border border-[#242424] overflow-hidden sticky top-24">
            <img
              src={settings.aboutPhoto || settings.heroImage}
              alt="About MY WORLD"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter grayscale contrast-125"
            />
          </div>
        </div>

        {/* Text Prose */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#0B0B0B] border border-[#242424] p-8 sm:p-10 space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#F5F5F5]">
              The Manifesto
            </h2>
            <div className="text-sm text-[#A1A1A1] leading-relaxed space-y-4 font-light whitespace-pre-line">
              {settings.aboutBio}
            </div>
          </div>

          {/* Listening Philosophy & Aesthetic Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-3">
              <div className="w-8 h-8 bg-[#111111] border border-[#242424] flex items-center justify-center text-[#F5F5F5]">
                <Disc className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                Physical & Vinyl Culture
              </h3>
              <p className="text-xs text-[#707070] leading-relaxed font-light">
                Belief in intentional listening. Dropping the needle on a record forces you to experience an artist’s journey sequentially, resisting frictionless playlist shuffle.
              </p>
            </div>

            <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-3">
              <div className="w-8 h-8 bg-[#111111] border border-[#242424] flex items-center justify-center text-[#F5F5F5]">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">
                Underground Over Hype
              </h3>
              <p className="text-xs text-[#707070] leading-relaxed font-light">
                Prioritizing obscure soundscapes, community white-labels, pirate radio archives, and raw tape hiss over mainstream algorithmic optimization.
              </p>
            </div>
          </div>

          {/* Listening Setup & Hardware */}
          <div className="bg-[#0B0B0B] border border-[#242424] p-8 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
              Listening Environment & Hardware
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 bg-[#111111] border border-[#1F1F1F]">
                <span className="text-[#707070] block text-[10px] uppercase">Turntable</span>
                <span className="text-[#F5F5F5] font-medium">Technics SL-1200MK7</span>
              </div>
              <div className="p-3 bg-[#111111] border border-[#1F1F1F]">
                <span className="text-[#707070] block text-[10px] uppercase">Amplification</span>
                <span className="text-[#F5F5F5] font-medium">Custom Tube Hybrid Preamp</span>
              </div>
              <div className="p-3 bg-[#111111] border border-[#1F1F1F]">
                <span className="text-[#707070] block text-[10px] uppercase">Monitoring</span>
                <span className="text-[#F5F5F5] font-medium">Sennheiser HD 650 & Genelec</span>
              </div>
            </div>
          </div>

          {/* Connect & Social links */}
          <div className="bg-[#0B0B0B] border border-[#242424] p-8 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
              Official Digital Channels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {settings.socialLinks?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111111] border border-[#1F1F1F] hover:border-[#707070] flex items-center justify-between text-xs transition-colors group"
                >
                  <span className="text-[#F5F5F5] font-medium">{link.platform}</span>
                  <div className="flex items-center gap-1.5 text-[#707070] group-hover:text-[#A1A1A1]">
                    <span>{link.handle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
