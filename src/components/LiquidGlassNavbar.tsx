import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Shield, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface LiquidGlassNavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAdminAuth: () => void;
  onOpenSearch: () => void;
}

export const LiquidGlassNavbar: React.FC<LiquidGlassNavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAdminAuth,
  onOpenSearch,
}) => {
  const { totalCount, setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'collections', label: 'Collections' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Apple-inspired Liquid Glass Island */}
      <header className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className={`pointer-events-auto transition-all duration-500 ease-out flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full liquid-glass-nav ${
            isScrolled
              ? 'scale-95 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-white/20'
              : 'scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
          } max-w-4xl w-full`}
        >
          {/* Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group cursor-pointer text-left shrink-0"
            title="TURVEX — Home"
          >
            <span className="text-base sm:text-lg font-black tracking-[0.25em] text-[#F5F5F5] group-hover:text-white uppercase transition-colors">
              TURVEX
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(link => {
              const isActive = currentTab === link.id || (link.id === 'shop' && currentTab === 'merch');
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-1.5 text-xs uppercase tracking-widest transition-all cursor-pointer rounded-full ${
                    isActive
                      ? 'text-white font-medium bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
                  )}
                </button>
              );
            })}

            {/* Admin shortcut if logged in */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-full flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'text-white bg-white/15'
                    : 'text-[#A1A1A1] hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-white" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Action Icons (Search, Bag, Mobile Trigger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#A1A1A1] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Search products"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Shopping Bag with dynamic counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#A1A1A1] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer group"
              title="Shopping Bag"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-[#050505] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-200">
                  {totalCount > 9 ? '9+' : totalCount}
                </span>
              )}
            </button>

            {/* Admin Key Button if not logged in */}
            {!isAdmin ? (
              <button
                onClick={onOpenAdminAuth}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider text-[#707070] hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-all cursor-pointer"
                title="Admin access (pass: rogy)"
              >
                <Lock className="w-3 h-3 text-[#888888]" />
                <span>Admin</span>
              </button>
            ) : null}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#A1A1A1] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer with Liquid Glass Backing */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer sheet */}
          <div className="relative w-72 max-w-[85vw] h-full liquid-glass-panel p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <span className="text-base font-black tracking-[0.25em] text-[#F5F5F5] uppercase">
                  TURVEX
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#A1A1A1] hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="mt-6 space-y-2">
                {navLinks.map(link => {
                  const isActive = currentTab === link.id || (link.id === 'shop' && currentTab === 'merch');
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all text-left ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold border border-white/20'
                          : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}

                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs uppercase tracking-wider text-white bg-white/10 border border-white/20 mt-4 text-left"
                  >
                    <Shield className="w-4 h-4 text-white" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Bottom Admin & Cart triggers in drawer */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3 px-4 bg-white text-[#050505] text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all hover:bg-white/90"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart ({totalCount})</span>
              </button>

              {!isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminAuth();
                  }}
                  className="w-full py-2 px-3 text-center text-[11px] text-[#707070] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Login (Pass: rogy)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
