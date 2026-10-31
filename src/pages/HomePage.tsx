import React, { useState } from 'react';
import { 
  MerchItem, 
  SiteSettings, 
  NavTab 
} from '../types';
import { 
  ArrowDown, 
  ArrowRight, 
  ShoppingBag, 
  Star, 
  ExternalLink, 
  Sparkles,
  PhoneCall,
  Eye,
  CheckCircle,
  Truck,
  ShieldCheck,
  Scissors
} from 'lucide-react';

interface HomePageProps {
  settings: SiteSettings;
  merch: MerchItem[];
  onSelectTab: (tab: NavTab) => void;
  onOpenMerchDetail: (item: MerchItem) => void;
  onOpenAdminAuth?: () => void;
  // Optional for backward compatibility
  songs?: any[];
  artists?: any[];
  albums?: any[];
  collections?: any[];
  gallery?: any[];
  quotes?: any[];
  onOpenDetail?: (type: any, data: any) => void;
  onOpenLightbox?: (item: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  merch,
  onSelectTab,
  onOpenMerchDetail,
  onOpenAdminAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const scrollToStore = () => {
    const el = document.getElementById('store-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'all', label: 'All Garments' },
    { id: 'hoodies', label: 'Hoodies' },
    { id: 'tees', label: 'T-Shirts' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'pants', label: 'Pants' },
    { id: 'headwear', label: 'Headwear' },
  ];

  const filteredMerch = merch.filter(item => {
    if (!item.isPublished) return false;
    if (selectedCategory === 'all') return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const featuredDrops = merch.filter(m => m.isFeatured && m.isPublished);

  const handleWhatsAppOrder = (item: MerchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = item.whatsappNumber?.replace(/[^0-9]/g, '') || '201000000000';
    const text = `Hello MY WORLD, I would like to order: ${item.name} (${item.price} ${item.currency || 'EGP'}). Please confirm availability.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full space-y-24">
      
      {/* 1. HERO SECTION: STREETWEAR BRAND DROP */}
      <section className="relative min-h-[85vh] flex flex-col justify-between border-b border-[#242424] overflow-hidden">
        {/* Background image overlay */}
        {settings.heroImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.heroImage}
              alt="Brand Lookbook Backdrop"
              className="w-full h-full object-cover opacity-25 filter grayscale contrast-125 brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 sm:pt-32 pb-16 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-8 space-y-8">
              <div className="text-xs uppercase tracking-[0.3em] text-[#A1A1A1] flex items-center gap-3 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ambient-pulse" />
                <span className="text-white font-semibold">MY WORLD APPAREL</span>
                <span className="text-[#555555]">·</span>
                <span className="text-[#A1A1A1]">NEW CAPSULE DROP IS LIVE</span>
              </div>

              <h1 
                onClick={onOpenAdminAuth}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#F5F5F5] uppercase leading-[0.95] cursor-pointer hover:text-white transition-colors"
                title="MY WORLD"
              >
                {settings.heroHeadline || 'MY WORLD. HEAVYWEIGHT STREETWEAR.'}
              </h1>

              <p className="text-base sm:text-xl text-[#A1A1A1] max-w-2xl font-light leading-relaxed">
                {settings.heroSubhead || 'Bespoke cuts, heavyweight knits, and limited capsule drops designed for everyday movement.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToStore}
                  className="px-8 py-4 bg-[#F5F5F5] hover:bg-white text-[#050505] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg hover:shadow-white/10 hover-luxury-lift cursor-pointer font-mono"
                >
                  <ShoppingBag className="w-4 h-4 text-black" />
                  <span>EXPLORE STORE</span>
                  <ArrowDown className="w-4 h-4 text-black" />
                </button>

                <button
                  onClick={() => onSelectTab('merch')}
                  className="px-6 py-4 bg-[#111111]/80 hover:bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#F5F5F5] text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 hover-luxury-lift cursor-pointer font-mono"
                >
                  <span>FULL COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Hero Spotlight Card */}
            <div className="lg:col-span-4 hidden lg:flex justify-end">
              {featuredDrops[0] ? (
                <div 
                  onClick={() => onOpenMerchDetail(featuredDrops[0])}
                  className="relative p-5 bg-[#0B0B0B]/90 border border-[#242424] shadow-2xl space-y-4 max-w-xs w-full hover-luxury-lift cursor-pointer group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      FEATURED PIECE
                    </span>
                    <span className="text-[10px] uppercase font-mono text-[#888888]">
                      {featuredDrops[0].category}
                    </span>
                  </div>

                  <div className="aspect-square relative overflow-hidden bg-[#161616]">
                    <img
                      src={featuredDrops[0].coverImage}
                      alt={featuredDrops[0].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/90 px-2 py-1 text-[11px] font-mono font-bold text-white">
                      {featuredDrops[0].price} {featuredDrops[0].currency || 'EGP'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase truncate">
                      {featuredDrops[0].name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-[#888888] font-mono">
                      <span>Sizes: {featuredDrops[0].sizes?.join(', ') || 'All Sizes'}</span>
                      <span className="text-emerald-400">Quick View →</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-[#0B0B0B]/90 border border-[#242424] text-center space-y-3 max-w-xs w-full font-mono">
                  <ShoppingBag className="w-8 h-8 text-white mx-auto" />
                  <p className="text-xs uppercase tracking-wider text-white font-bold">LIMITED CAPSULE 01</p>
                  <p className="text-[11px] text-[#707070]">Exclusive garments handcrafted with premium heavyweight textiles.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Continuous Fluid Ticker Marquee */}
        <div className="relative z-10 w-full bg-[#080808] border-y border-[#242424] py-3.5 overflow-hidden select-none">
          <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-[0.25em] text-[#888888] font-mono flex items-center gap-8">
            <span className="text-[#F5F5F5] font-bold">MY WORLD STORE</span>
            <span>·</span>
            <span>HEAVYWEIGHT HOODIES 450 GSM</span>
            <span>·</span>
            <span>ACID WASH OVERSIZED TEES</span>
            <span>·</span>
            <span>DIRECT WHATSAPP ORDERING</span>
            <span>·</span>
            <span>FAST SHIPPING ACROSS EGYPT & WORLDWIDE</span>
            <span>·</span>
            <span>PRICES IN EGP</span>
            <span>·</span>
            <span>LIMITED PRODUCTION RUNS</span>
            <span>·</span>
            <span className="text-[#F5F5F5] font-bold">MY WORLD STORE</span>
            <span>·</span>
            <span>HEAVYWEIGHT HOODIES 450 GSM</span>
            <span>·</span>
            <span>ACID WASH OVERSIZED TEES</span>
            <span>·</span>
            <span>DIRECT WHATSAPP ORDERING</span>
            <span>·</span>
            <span>FAST SHIPPING ACROSS EGYPT & WORLDWIDE</span>
            <span>·</span>
            <span>PRICES IN EGP</span>
          </div>
        </div>

        {/* Hero Bottom Metadata Ribbon */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-5 w-full flex flex-wrap items-center justify-between gap-4 text-xs text-[#707070] font-mono">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold">{merch.length} Garments in Catalog</span>
            <span>·</span>
            <span className="text-emerald-400">{merch.filter(m => m.inStock).length} Available In Stock</span>
            <span>·</span>
            <span>Currency: EGP</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#A1A1A1]">
            <Truck className="w-3.5 h-3.5 text-white" />
            <span>Fast Cairo & Regional Delivery</span>
          </div>
        </div>
      </section>

      {/* 2. THE STORE SECTION (سفخقث) — FEATURED GARMENTS GRID */}
      <section id="store-section" className="max-w-7xl mx-auto px-6 scroll-mt-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#242424]">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#707070] mb-1 font-mono">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Available Drops & Apparel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F5F5F5] uppercase">
              The Store Collection
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#0B0B0B] text-[#A1A1A1] border-[#242424] hover:text-white hover:border-[#666666]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMerch.length === 0 ? (
          <div className="py-20 text-center border border-[#242424] bg-[#0B0B0B] text-xs font-mono text-[#707070] space-y-3">
            <ShoppingBag className="w-8 h-8 text-[#555555] mx-auto" />
            <p>No garments found in this category.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-white underline hover:no-underline cursor-pointer"
            >
              View all garments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerch.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenMerchDetail(item)}
                className="group bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover-luxury-lift"
              >
                {/* Product Photo */}
                <div className="aspect-[4/5] relative overflow-hidden bg-[#111111]">
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-[#050505]/90 border border-[#242424] px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[#F5F5F5]">
                    {item.category}
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 right-3">
                    {item.inStock ? (
                      <span className="bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-950/80 border border-red-800 text-red-400 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Quick View Hover Indicator */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 backdrop-blur-sm px-3 py-1.5 border border-[#333333] flex items-center gap-1.5 text-xs text-white font-mono">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Garment</span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-bold text-white uppercase group-hover:text-emerald-400 transition-colors truncate">
                      {item.name}
                    </h3>
                    <span className="text-base font-mono font-bold text-white shrink-0 ml-2">
                      {item.price} {item.currency || 'EGP'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#888888] font-light line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Sizes Available */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-mono text-[#666666]">Sizes:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.sizes?.map(sz => (
                        <span key={sz} className="text-[10px] font-mono bg-[#161616] border border-[#242424] px-1.5 py-0.5 text-[#CCCCCC]">
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleWhatsAppOrder(item, e)}
                      className="flex-1 py-2.5 bg-[#161616] hover:bg-emerald-950/60 border border-[#262626] hover:border-emerald-500/60 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Order on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenMerchDetail(item)}
                      className="p-2.5 bg-[#111111] border border-[#242424] hover:border-white text-white transition-colors cursor-pointer"
                      title="View garment details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. BRAND CRAFTSMANSHIP & SPECIFICATIONS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0B0B0B] border border-[#242424] p-8 sm:p-12 hover-luxury-lift space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#707070] font-mono block mb-1">
              Garment Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F5F5]">
              Craftsmanship & Production Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-[#1C1C1C]">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Scissors className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono">450 GSM Heavyweight</h3>
              </div>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Milled from high-density Egyptian cotton French Terry. Substantial hand feel, structural drape, and tailored durability designed to last seasons.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Boxy Architectural Cut</h3>
              </div>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Relaxed dropped shoulders, widened body silhouette, and ribbed hem tension calibrated for perfect proportion over any trousers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Truck className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Fast Direct Delivery</h3>
              </div>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Direct dispatch from Cairo across all Egyptian governorates with tracked courier delivery and straightforward WhatsApp customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FULL STORE BANNER CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="relative bg-gradient-to-r from-[#111111] via-[#0D0D0D] to-[#141414] border border-[#2A2A2A] p-8 sm:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 block">
              MY WORLD APPAREL
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Looking for our complete lookbook & drop archives?
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1A1] font-light leading-relaxed">
              Explore the dedicated Store page with detailed garment specifications, zoom galleries, and direct checkout inquiries.
            </p>
          </div>

          <button
            onClick={() => {
              onSelectTab('merch');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white hover:bg-[#E5E5E5] text-black text-xs font-bold uppercase tracking-widest transition-all shrink-0 font-mono flex items-center gap-3 cursor-pointer shadow-xl hover-luxury-lift"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
            <span>ENTER FULL STORE</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </section>

    </div>
  );
};
