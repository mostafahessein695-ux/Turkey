import React, { useState, useMemo, useEffect } from 'react';
import { MerchItem } from '../types';
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  MessageCircle, 
  ExternalLink, 
  Check, 
  X, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Package, 
  Layers, 
  Ruler, 
  Info, 
  CheckCircle2, 
  Share2, 
  Copy 
} from 'lucide-react';

interface MerchPageProps {
  merch: MerchItem[];
  onOpenDetail?: (item: MerchItem) => void;
}

export const MerchPage: React.FC<MerchPageProps> = ({ merch }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [modalItem, setModalItem] = useState<MerchItem | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Close modal on Escape key press and prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalItem(null);
      }
    };
    if (modalItem) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalItem]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    merch.forEach(item => {
      if (item.category) set.add(item.category.toLowerCase());
    });
    return ['all', ...Array.from(set)];
  }, [merch]);

  // Filter items
  const filteredMerch = useMemo(() => {
    return merch.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category?.toLowerCase() !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [merch, selectedCategory, searchQuery]);

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency?.trim() || 'EGP';
    if (cur === '$' || cur === '£' || cur === '€') {
      return `${cur}${price.toLocaleString()}`;
    }
    return `${price.toLocaleString()} ${cur}`;
  };

  const handleSelectSize = (itemId: string, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size,
    }));
  };

  const handleWhatsAppOrder = (item: MerchItem, chosenSize?: string) => {
    const size = chosenSize || selectedSizes[item.id] || item.sizes?.[0] || 'Default';
    const phone = (item.whatsappNumber || '').replace(/[^\d+]/g, '') || '201000000000';
    const message = encodeURIComponent(
      `Hello! I would like to order "${item.name}" from MY WORLD Store.\nSize: ${size}\nPrice: ${formatPrice(item.price, item.currency)}`
    );
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
  };

  const openView = (item: MerchItem) => {
    setModalItem(item);
    setActiveModalImage(item.coverImage || item.images?.[0] || '');
    setShowSizeGuide(false);
    setCopiedLink(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header Section */}
      <div className="border-b border-[#242424] pb-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[#707070]">
          <ShoppingBag className="w-4 h-4 text-white" />
          <span>OFFICIAL MERCHANDISE & STREETWEAR</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
              CLOTHING & GEAR
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-2xl mt-2 font-mono">
              Heavyweight cottons, custom cuts, distressed graphics, and limited capsule drops. Click any piece to inspect details, fabric specifications, and size availability.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#707070] bg-[#0E0E0E] px-4 py-2 border border-[#242424]">
            <Package className="w-3.5 h-3.5 text-white" />
            <span>{filteredMerch.length} {filteredMerch.length === 1 ? 'PIECE' : 'PIECES'} IN ARCHIVE</span>
          </div>
        </div>

        {/* 2. Controls: Filter tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#101010] text-[#888888] hover:text-white hover:bg-[#1A1A1A] border border-[#242424]'
                  }`}
                >
                  {cat === 'all' ? 'All Pieces' : cat}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search garments..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0E0E0E] border border-[#242424] text-xs text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#707070] transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707070] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredMerch.length === 0 ? (
        <div className="bg-[#0B0B0B] border border-[#242424] p-12 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-[#404040] mx-auto" />
          <h3 className="text-base font-bold uppercase tracking-wider text-[#F5F5F5]">
            No garments found
          </h3>
          <p className="text-xs text-[#707070] max-w-sm mx-auto font-mono">
            Try choosing a different category or clearing your search term to view all clothing items.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="mt-2 px-4 py-2 bg-[#1A1A1A] border border-[#333] text-xs uppercase tracking-wider hover:bg-[#252525] text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* 4. Product Catalog Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerch.map(item => {
            const currentSize = selectedSizes[item.id] || (item.sizes && item.sizes.length > 0 ? item.sizes[0] : '');

            return (
              <div
                key={item.id}
                className="group bg-[#0A0A0A] border border-[#242424] hover:border-[#777777] transition-all flex flex-col justify-between overflow-hidden shadow-lg"
              >
                {/* 1. Clickable Image Container */}
                <div 
                  onClick={() => openView(item)}
                  className="relative aspect-square w-full overflow-hidden bg-[#111111] cursor-pointer"
                  title="Click to view garment details"
                >
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient shadow for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                  {/* Badges top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                    {item.isFeatured && (
                      <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                        DROP
                      </span>
                    )}
                    <span className="bg-[#050505]/90 backdrop-blur-sm text-[#CCCCCC] text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#333]">
                      {item.category}
                    </span>
                  </div>

                  {/* Stock badge top-right */}
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    {item.inStock ? (
                      <span className="bg-[#122B15] text-[#4ADE80] border border-[#23582A] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 font-bold">
                        IN STOCK
                      </span>
                    ) : (
                      <span className="bg-[#2B1212] text-[#F87171] border border-[#582323] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 font-bold">
                        SOLD OUT
                      </span>
                    )}
                  </div>

                  {/* Prominent Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center z-10">
                    <span className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl">
                      <Eye className="w-4 h-4 text-black" />
                      <span>VIEW DETAILS & SIZES</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#CCCCCC] tracking-wider">
                      Click to open full piece inspect
                    </span>
                  </div>
                </div>

                {/* 2. Garment Details & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Clickable title */}
                    <div 
                      onClick={() => openView(item)}
                      className="cursor-pointer group/title"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-[#F5F5F5] group-hover/title:text-white line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        <div className="text-base font-black font-mono text-white tabular-nums shrink-0">
                          {formatPrice(item.price, item.currency)}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-xs text-[#888888] group-hover/title:text-[#AAAAAA] line-clamp-2 leading-relaxed mt-1 transition-colors">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sizes Selector on Card */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#1C1C1C]">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#707070] uppercase">
                        <span>Select Size</span>
                        <span className="text-white font-bold">{currentSize}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.sizes.map(sz => {
                          const isSelected = currentSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSize(item.id, sz);
                              }}
                              className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-white text-black font-black border border-white'
                                  : 'bg-[#121212] text-[#999999] hover:text-white border border-[#2B2B2B] hover:border-[#666]'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Card Action Buttons: View Details + Direct Order */}
                  <div className="pt-2 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* VIEW BUTTON (Always primary on card) */}
                      <button
                        type="button"
                        onClick={() => openView(item)}
                        className="w-full bg-[#161616] hover:bg-white text-white hover:text-black border border-[#333333] hover:border-white py-2 px-3 text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Open Details View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {/* WhatsApp Order or Sold Out */}
                      {item.inStock ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppOrder(item, currentSize);
                          }}
                          className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#333333] hover:border-[#25D366] py-2 px-3 text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Quick WhatsApp Order"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>Order</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-[#121212] text-[#555555] border border-[#222222] py-2 px-3 text-[10px] uppercase font-mono tracking-wider cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Production & Quality Notice */}
      <div className="bg-[#0A0A0A] border border-[#242424] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#888888] font-mono">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-white uppercase font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>HEAVYWEIGHT QUALITY</span>
          </div>
          <p className="leading-relaxed">
            All garments use custom dense knit (280-450 GSM), custom-dyed finishes, and high-density screen inks built to endure.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-white uppercase font-bold tracking-wider">
            <Layers className="w-4 h-4 text-white" />
            <span>LIMITED RUNS</span>
          </div>
          <p className="leading-relaxed">
            Pieces are produced in numbered underground drops. Once an archive drop sells out, it will not be restocked.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-white uppercase font-bold tracking-wider">
            <MessageCircle className="w-4 h-4 text-white" />
            <span>DIRECT ORDERING</span>
          </div>
          <p className="leading-relaxed">
            Order directly via WhatsApp or external payment links with personal size confirmation and tracking.
          </p>
        </div>
      </div>

      {/* 6. COMPLETE GARMENT VIEW & DETAILS MODAL */}
      {modalItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setModalItem(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#090909] border border-[#333333] shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6"
          >
            {/* Top Bar with Badges and Close */}
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] bg-[#141414] px-2.5 py-1 border border-[#242424]">
                  {modalItem.category}
                </span>
                {modalItem.inStock ? (
                  <span className="bg-[#122B15] text-[#4ADE80] border border-[#23582A] text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 font-bold">
                    IN STOCK
                  </span>
                ) : (
                  <span className="bg-[#2B1212] text-[#F87171] border border-[#582323] text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 font-bold">
                    SOLD OUT
                  </span>
                )}
                {modalItem.isFeatured && (
                  <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                    FEATURED DROP
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setModalItem(null)}
                className="p-2 text-[#707070] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer border border-[#2B2B2B]"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Modal Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Product Imagery */}
              <div className="md:col-span-6 space-y-3">
                <div className="aspect-square bg-[#121212] border border-[#242424] overflow-hidden relative group">
                  <img
                    src={activeModalImage || modalItem.coverImage}
                    alt={modalItem.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-1 text-[9px] font-mono text-[#A1A1A1] pointer-events-none">
                    MY WORLD ARCHIVE
                  </div>
                </div>

                {/* Thumbnails if multiple images exist */}
                {modalItem.images && modalItem.images.length > 1 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#707070] block">
                      Image Angles
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {modalItem.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveModalImage(img)}
                          className={`w-16 h-16 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                            activeModalImage === img ? 'border-white' : 'border-[#333] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Garment Information & Specs */}
              <div className="md:col-span-6 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                    {modalItem.name}
                  </h2>

                  <div className="flex items-baseline gap-3 mt-3">
                    <div className="text-3xl font-black font-mono text-white">
                      {formatPrice(modalItem.price, modalItem.currency)}
                    </div>
                    <span className="text-xs text-[#707070] font-mono uppercase">
                      Inclusive of direct packing
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-[#1F1F1F] pt-4 space-y-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#707070] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-white" />
                    <span>Garment Details & Description</span>
                  </h4>
                  <p className="text-xs text-[#CCCCCC] leading-relaxed whitespace-pre-line font-mono">
                    {modalItem.description || 'Exclusive underground collection garment. Premium heavy material designed with durable detailing, reinforced stitching, and authentic street cuts.'}
                  </p>
                </div>

                {/* Fabric & Silhouette Specs */}
                <div className="bg-[#111111] border border-[#222222] p-4 space-y-2 text-xs font-mono text-[#A1A1A1]">
                  <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                    <span className="text-[#666666] uppercase">Material</span>
                    <span className="text-white font-semibold">100% Dense Combed Cotton</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                    <span className="text-[#666666] uppercase">Fabric Density</span>
                    <span className="text-white font-semibold">380 - 450 GSM Heavyweight</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                    <span className="text-[#666666] uppercase">Cut & Fit</span>
                    <span className="text-white font-semibold">Oversized Drop-Shoulder</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666] uppercase">Print & Finish</span>
                    <span className="text-white font-semibold">High-Density Monochrome Screen</span>
                  </div>
                </div>

                {/* Size Selection */}
                {modalItem.sizes && modalItem.sizes.length > 0 && (
                  <div className="space-y-3 border-t border-[#1F1F1F] pt-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#888888] uppercase">AVAILABLE SIZES</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold uppercase">
                          Selected: {selectedSizes[modalItem.id] || modalItem.sizes[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSizeGuide(!showSizeGuide)}
                          className="text-[#888888] hover:text-white underline text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Ruler className="w-3 h-3" />
                          <span>{showSizeGuide ? 'Hide Guide' : 'Size Guide'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {modalItem.sizes.map(sz => {
                        const isSelected = (selectedSizes[modalItem.id] || modalItem.sizes[0]) === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSelectSize(modalItem.id, sz)}
                            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-white text-black font-black border border-white'
                                : 'bg-[#141414] text-[#888] hover:text-white border border-[#2B2B2B] hover:border-[#666]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                            <span>{sz}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expandable Size Guide Table */}
                    {showSizeGuide && (
                      <div className="mt-2 p-3 bg-[#0B0B0B] border border-[#242424] text-[11px] font-mono space-y-2 animate-fade-in">
                        <span className="text-white font-bold uppercase block">
                          Size Measurement Chart (CM)
                        </span>
                        <div className="grid grid-cols-4 gap-2 text-center text-[#707070] border-b border-[#222] pb-1">
                          <span>Size</span>
                          <span>Chest</span>
                          <span>Length</span>
                          <span>Sleeve</span>
                        </div>
                        <div className="space-y-1 text-center text-[#A1A1A1]">
                          <div className="grid grid-cols-4 gap-2"><span>S</span><span>56 cm</span><span>69 cm</span><span>59 cm</span></div>
                          <div className="grid grid-cols-4 gap-2"><span>M</span><span>60 cm</span><span>72 cm</span><span>61 cm</span></div>
                          <div className="grid grid-cols-4 gap-2"><span>L</span><span>64 cm</span><span>75 cm</span><span>63 cm</span></div>
                          <div className="grid grid-cols-4 gap-2"><span>XL</span><span>68 cm</span><span>78 cm</span><span>65 cm</span></div>
                          <div className="grid grid-cols-4 gap-2"><span>XXL</span><span>72 cm</span><span>81 cm</span><span>66 cm</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Order Buttons */}
                <div className="space-y-3 pt-4 border-t border-[#1F1F1F]">
                  {modalItem.inStock ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppOrder(modalItem)}
                        className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#3A3A3A] hover:border-white py-3.5 px-4 text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <span>ORDER VIA WHATSAPP</span>
                      </button>

                      {modalItem.orderUrl && (
                        <a
                          href={modalItem.orderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white hover:bg-[#E5E5E5] text-black py-3 px-4 text-xs uppercase font-black tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Go to Online Store Checkout</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-[#121212] border border-[#222] text-center text-xs font-mono text-[#777] uppercase tracking-wider">
                      This piece is currently archived / sold out
                    </div>
                  )}

                  {/* Share button */}
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[#666666]">
                    <span>Official MY WORLD Piece</span>
                    <button
                      onClick={handleCopyLink}
                      className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                          <span className="text-[#4ADE80]">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Piece</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
