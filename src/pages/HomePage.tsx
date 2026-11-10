import React from 'react';
import { MerchItem, SiteSettings, NavTab } from '../types';
import { ProductCard } from '../components/ProductCard';
import { 
  ArrowDown, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Ruler,
  Layers,
  ChevronDown
} from 'lucide-react';

interface HomePageProps {
  settings: SiteSettings;
  merch: MerchItem[];
  onSelectTab: (tab: NavTab) => void;
  onOpenMerchDetail: (item: MerchItem) => void;
  onOpenAdminAuth?: () => void;
  onNavigateToShopWithCategory?: (category: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  merch,
  onSelectTab,
  onOpenMerchDetail,
  onNavigateToShopWithCategory,
}) => {
  const publishedMerch = merch.filter(m => m.isPublished);

  // New arrivals & Best sellers
  const newArrivals = publishedMerch.filter(m => m.isNewArrival || m.isFeatured).slice(0, 4);
  const bestSellers = publishedMerch.filter(m => m.isBestSeller).slice(0, 4);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-24 sm:space-y-36">
      {/* 1. FULL-SCREEN HERO SECTION */}
      <section className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-6 pt-32 pb-12 overflow-hidden">
        {/* Cinematic Background Image with Dark Vignette */}
        <div className="absolute inset-0 -z-10 bg-[#050505]">
          <img
            src={settings?.websiteImages?.homeHeroImage || settings?.heroImage || "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2000&q=85"}
            alt="TURVEX Campaign"
            className="w-full h-full object-cover object-center filter grayscale contrast-125 opacity-40 scale-105 animate-in fade-in zoom-in-105 duration-1000"
          />
          {/* Multi-layered dark luxury gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80" />
        </div>

        {/* Ambient Subtle Specular Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Spacer for floating navbar */}
        <div className="w-full h-8" />

        {/* Central Brand Narrative */}
        <div className="max-w-4xl mx-auto text-center space-y-6 z-10 px-2">
          {/* Minimal Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#E0E0E0]">
              Autumn / Winter Capsule 01
            </span>
          </div>

          {/* Monumental Headline */}
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-800">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-[0.95]">
              BUILT DIFFERENT.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40">
                WORN DIFFERENT.
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-base text-[#A1A1A1] max-w-xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
            Bespoke 480GSM French Terry knitwear, hand-acid washed combed tees, and relaxed wide-leg tailoring. Engineered in limited runs for everyday movement.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button
              onClick={() => onSelectTab('shop')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)] cursor-pointer active:scale-95"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectTab('collections')}
              className="w-full sm:w-auto px-7 py-4 liquid-glass-nav text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>View Capsules</span>
            </button>
          </div>
        </div>

        {/* Animated Scroll Indicator */}
        <div className="pt-8 flex flex-col items-center gap-2 z-10">
          <button
            onClick={() => scrollToSection('featured-capsules')}
            className="group flex flex-col items-center gap-2 text-[10px] uppercase font-mono tracking-[0.25em] text-[#707070] hover:text-white transition-colors cursor-pointer"
          >
            <span>Scroll to Discover</span>
            <div className="w-7 h-11 rounded-full border border-white/20 flex items-start justify-center p-1.5 group-hover:border-white/40 transition-colors">
              <span className="w-1 h-2 rounded-full bg-white animate-bounce" />
            </div>
          </button>
        </div>
      </section>

      {/* 2. SPECIFICATION VALUE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-white block">480 GSM</span>
            <span className="text-[11px] uppercase tracking-wider text-[#888888] font-mono">Dense French Terry</span>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-white block">100%</span>
            <span className="text-[11px] uppercase tracking-wider text-[#888888] font-mono">Combed Organic Cotton</span>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-white block">Boxy Fit</span>
            <span className="text-[11px] uppercase tracking-wider text-[#888888] font-mono">Dropped Shoulder Cut</span>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-white block">48H</span>
            <span className="text-[11px] uppercase tracking-wider text-[#888888] font-mono">Studio Express Dispatch</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CAPSULE SHOWCASES */}
      <section id="featured-capsules" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#707070] font-mono block">
              Curated Series
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Featured Collections
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('collections')}
            className="text-xs uppercase tracking-widest text-[#A1A1A1] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View All Capsules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div
            onClick={() => onSelectTab('shop')}
            className="group relative aspect-[4/5] rounded-3xl overflow-hidden liquid-glass-card cursor-pointer"
          >
            <img
              src={settings?.websiteImages?.capsuleHeavyweightImage || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85"}
              alt="Heavyweight Hoodie Series"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CCCCCC]">
                Capsule 01
              </span>
              <h3 className="text-xl font-bold uppercase text-white">
                480GSM Boxy Hoodies
              </h3>
              <p className="text-xs text-[#A1A1A1] line-clamp-2">
                Double-lined zero-drawstring hoods in Washed Black, Vintage Bone, and Raw Clay.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span>Shop Hoodies</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onSelectTab('shop')}
            className="group relative aspect-[4/5] rounded-3xl overflow-hidden liquid-glass-card cursor-pointer"
          >
            <img
              src={settings?.websiteImages?.capsuleAcidWashImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85"}
              alt="Acid Wash Tees"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CCCCCC]">
                Capsule 02
              </span>
              <h3 className="text-xl font-bold uppercase text-white">
                Acid Wash &amp; Patina Tees
              </h3>
              <p className="text-xs text-[#A1A1A1] line-clamp-2">
                280GSM stone-washed combed cotton with tight reinforced necklines.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span>Shop Tees</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onSelectTab('shop')}
            className="group relative aspect-[4/5] rounded-3xl overflow-hidden liquid-glass-card cursor-pointer"
          >
            <img
              src={settings?.websiteImages?.capsuleTacticalImage || "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85"}
              alt="Tactical Sweatpants"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CCCCCC]">
                Capsule 03
              </span>
              <h3 className="text-xl font-bold uppercase text-white">
                Wide-Leg Cargo Sweatpants
              </h3>
              <p className="text-xs text-[#A1A1A1] line-clamp-2">
                450GSM brushed fleece featuring internal ankle toggles and zippered pockets.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span>Shop Pants</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#707070] font-mono block">
              Just Dropped &bull; Limited Run
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('shop')}
            className="text-xs uppercase tracking-widest text-[#A1A1A1] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Explore All Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenMerchDetail}
            />
          ))}
        </div>
      </section>

      {/* 5. EDITORIAL CAMPAIGN BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden liquid-glass-panel border border-white/15 p-8 sm:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#888888]">
                Material Manifesto
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none">
                Pure French Terry.<br />Zero Compromise.
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-lg font-light leading-relaxed">
                We believe garments should outlast seasons. Our custom high-density knit preserves its boxy silhouette and heavyweight drape without distortion or pilling.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onSelectTab('about')}
                  className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/90 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Read The Manifesto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
              <img
                src={settings?.websiteImages?.brandStoryImage || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85"}
                alt="TURVEX Atelier"
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS SECTION */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#707070] font-mono block">
                Archive Staples &bull; Proven Silhouettes
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                Best Sellers
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('shop')}
              className="text-xs uppercase tracking-widest text-[#A1A1A1] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Full Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {bestSellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={onOpenMerchDetail}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. BRAND STORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="liquid-glass-card rounded-3xl p-8 sm:p-14 border border-white/10 space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#707070]">
              The TURVEX Origin
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              An Independent Streetwear Atelier
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1A1] font-light leading-relaxed">
              TURVEX exists at the intersection of dark luxury and modern utilitarian streetwear. We craft garments for individuals who value tangible fabric density, subtle textures, and enduring form.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10 text-xs text-[#CCCCCC]">
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-white block">
                01. Heavyweight Philosophy
              </span>
              <p className="text-[#888888] leading-relaxed">
                480 GSM cotton provides the structural stiffness necessary for true dropped-shoulder streetwear volume.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-white block">
                02. Non-Disposable Craft
              </span>
              <p className="text-[#888888] leading-relaxed">
                Reinforced bar-tacking on stress points, double-needle coverstitching, and metal two-way zippers.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-white block">
                03. Limited Drops
              </span>
              <p className="text-[#888888] leading-relaxed">
                We produce in controlled quantities. When a colorway or capsule sells out, it enters our permanent archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DROP LIST / NEWSLETTER SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#707070]">
            Direct Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            Join The Private Drop List
          </h2>
          <p className="text-xs text-[#A1A1A1] max-w-md mx-auto leading-relaxed">
            Receive private access links 1 hour before public capsule releases. No spam. Only drop notifications.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('You have been added to the TURVEX private drop list.'); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#666666] outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Get Access
          </button>
        </form>
      </section>
    </div>
  );
};
