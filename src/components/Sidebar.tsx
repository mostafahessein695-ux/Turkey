import React, { useState } from 'react';
import { NavTab, SiteSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Music, 
  Disc, 
  Mic, 
  ListMusic, 
  Images, 
  Quote, 
  Info, 
  Shield, 
  Lock, 
  LogOut, 
  Menu, 
  X,
  ExternalLink 
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAdminAuth: () => void;
  settings: SiteSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAdminAuth,
  settings,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, isAdmin, logout, adminEmail } = useAuth();

  // Navigation items matching exact requested order & icons
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: Mic },
    { id: 'collections', label: 'Collections', icon: ListMusic },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'quotes', label: 'Quotes', icon: Quote },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-6 overflow-y-auto">
      {/* Top: Brand Logo / Wordmark */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-[#242424]">
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group cursor-pointer block"
          >
            <span className="text-lg font-black tracking-[0.25em] text-[#F5F5F5] group-hover:text-white uppercase block leading-none">
              MY WORLD
            </span>
            <span className="text-[10px] tracking-widest text-[#707070] uppercase mt-1 block">
              Music & Lifestyle
            </span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#555555] block px-3 py-1 font-mono">
            Navigation
          </span>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none text-left ${
                  isActive
                    ? 'bg-[#141414] text-[#F5F5F5] font-semibold border-l-2 border-white pl-2.5'
                    : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#0B0B0B]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#707070]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Admin management link - visible ONLY to authorized administrator */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-[#1C1C1C]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#707070] block px-3 py-1 font-mono">
                Management
              </span>
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none text-left ${
                  currentTab === 'admin'
                    ? 'bg-[#141414] text-[#F5F5F5] font-semibold border-l-2 border-white pl-2.5'
                    : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#0B0B0B]'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0 text-white" />
                <span className="truncate">Admin Dashboard</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Profile / Brand / Social area */}
      <div className="pt-6 border-t border-[#242424] space-y-4">
        {/* Social channels preview */}
        {settings.socialLinks && settings.socialLinks.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#555555] block font-mono">
              Channels
            </span>
            <div className="flex flex-wrap gap-2 text-[11px] text-[#A1A1A1]">
              {settings.socialLinks.slice(0, 3).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* User state or owner gateway */}
        <div className="pt-2 border-t border-[#1C1C1C]">
          {isAdmin ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-white truncate max-w-[140px]">
                  <span className="w-1.5 h-1.5 bg-white shrink-0" />
                  <span className="truncate">{user?.email || adminEmail}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-[#707070] hover:text-[#F5F5F5] transition-colors p-1"
                  title="Sign out of admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-[#555555] block uppercase tracking-wider font-mono">
                Server-Verified Admin
              </span>
            </div>
          ) : (
            <button
              onClick={onOpenAdminAuth}
              className="w-full flex items-center justify-between text-left text-[11px] text-[#555555] hover:text-[#A1A1A1] transition-colors py-1 cursor-pointer"
              title="Administrator Sign In"
            >
              <span>Personal Archive</span>
              <Lock className="w-3 h-3 text-[#444444]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP FIXED LEFT SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[#050505] border-r border-[#242424] z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE TOP BAR WITH DRAWER TRIGGER */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-md border-b border-[#242424] px-5 py-3.5 flex items-center justify-between">
        <button
          onClick={() => handleNavClick('home')}
          className="text-left cursor-pointer"
        >
          <span className="text-base font-black tracking-[0.25em] text-[#F5F5F5] uppercase">
            MY WORLD
          </span>
        </button>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs uppercase tracking-wider text-white border border-[#333333] px-2.5 py-1 flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          )}

          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 text-[#A1A1A1] hover:text-white transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 3. MOBILE COLLAPSIBLE DRAWER */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Pane */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#050505] border-r border-[#242424] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
