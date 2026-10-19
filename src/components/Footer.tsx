import React from 'react';
import { SiteSettings, NavTab } from '../types';
import { Disc, ArrowUp } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onSelectTab: (tab: NavTab) => void;
  onOpenAdminAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectTab,
  onOpenAdminAuth,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050505] border-t border-[#242424] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Introduction */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-xl font-bold tracking-widest text-[#F5F5F5] uppercase">
              MY WORLD
            </h3>
            <p className="text-sm text-[#A1A1A1] leading-relaxed max-w-sm">
              {settings.heroSubhead || 'A curated universe of sounds, underground music culture, architectural aesthetics, and personal artifacts.'}
            </p>
            <div className="pt-2 text-xs text-[#707070]">
              <span>Personal Archive</span>
              <span className="mx-2">·</span>
              <span>Non-Commercial</span>
              <span className="mx-2">·</span>
              <span>Sound & Form</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
              Index
            </h4>
            <div className="flex flex-col gap-2 text-sm text-[#A1A1A1]">
              <button
                onClick={() => { onSelectTab('home'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => { onSelectTab('music'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Music Library
              </button>
              <button
                onClick={() => { onSelectTab('albums'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Curated Albums
              </button>
              <button
                onClick={() => { onSelectTab('artists'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Artists & Profiles
              </button>
              <button
                onClick={() => { onSelectTab('collections'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Thematic Collections
              </button>
              <button
                onClick={() => { onSelectTab('gallery'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Visual Gallery
              </button>
              <button
                onClick={() => { onSelectTab('quotes'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                Quotes & Liner Notes
              </button>
              <button
                onClick={() => { onSelectTab('about'); scrollToTop(); }}
                className="text-left hover:text-[#F5F5F5] transition-colors"
              >
                About & Philosophy
              </button>
            </div>
          </div>

          {/* Social Links & External */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#707070]">
              Channels & Connect
            </h4>
            <div className="flex flex-col gap-2 text-sm text-[#A1A1A1]">
              {settings.socialLinks?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5F5F5] transition-colors flex items-center justify-between group max-w-xs"
                >
                  <span>{link.platform}</span>
                  <span className="text-xs text-[#707070] group-hover:text-[#A1A1A1]">{link.handle}</span>
                </a>
              ))}
            </div>
            <div className="pt-4">
              <button
                onClick={() => { onSelectTab('about'); scrollToTop(); }}
                className="text-xs uppercase tracking-wider text-[#A1A1A1] hover:text-[#F5F5F5] underline underline-offset-4"
              >
                Read about the philosophy →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#181818] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#707070]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} MY WORLD. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <button
              onClick={onOpenAdminAuth}
              className="text-[#454545] hover:text-[#707070] transition-colors"
              title="Access Admin Console"
            >
              Owner
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
