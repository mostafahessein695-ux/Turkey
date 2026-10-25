import React, { useState, useMemo } from 'react';
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
  Layers
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
      `Hello! I would like to order "${item.name}" from MY WORLD Store.\nSize: ${size}\nPrice: ${item.currency || '$'}${item.price}`
    );
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
  };

  const openQuickView = (item: MerchItem) => {
    setModalItem(item);
    setActiveModalImage(item.coverImage || item.images?.[0] || '');
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
              Heavyweight cottons, custom cuts, distressed graphics, and limited capsule drops. Direct from the studio.
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
                className="group bg-[#0A0A0A] border border-[#242424] hover:border-[#666666] transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#111111]">
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient bottom shadow for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                  {/* Badges top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
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
                  <div className="absolute top-3 right-3 z-10">
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

                  {/* Quick view button */}
                  <button
                    onClick={() => openQuickView(item)}
                    className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white p-2 border border-[#333] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider"
                    title="Quick Look"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>

                {/* Garment Details & Ordering */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-[#F5F5F5] group-hover:text-white line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <div className="text-base font-black font-mono text-white tabular-nums shrink-0">
                        {item.currency || '$'}{item.price}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Sizes Selector */}
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
                              onClick={() => handleSelectSize(item.id, sz)}
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

                  {/* Order Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    {item.inStock ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* WhatsApp Direct Buy */}
                        <button
                          onClick={() => handleWhatsAppOrder(item, currentSize)}
                          className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#333333] hover:border-white py-2 px-3 text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>Order (WA)</span>
                        </button>

                        {/* External checkout or Info Modal */}
                        {item.orderUrl ? (
                          <a
                            href={item.orderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white hover:bg-[#E5E5E5] text-black py-2 px-3 text-xs uppercase font-black tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Checkout</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={() => openQuickView(item)}
                            className="w-full bg-white hover:bg-[#E5E5E5] text-black py-2 px-3 text-xs uppercase font-black tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Details</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-[#121212] text-[#555555] border border-[#222222] py-2 px-3 text-xs uppercase font-mono tracking-wider cursor-not-allowed"
                      >
                        Archived / Sold Out
                      </button>
                    )}
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

      {/* 6. Quick Look Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#090909] border border-[#333333] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setModalItem(null)}
              className="absolute top-4 right-4 p-2 text-[#707070] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Product Gallery Images */}
              <div className="space-y-3">
                <div className="aspect-square bg-[#121212] border border-[#242424] overflow-hidden">
                  <img
                    src={activeModalImage || modalItem.coverImage}
                    alt={modalItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails if multiple images exist */}
                {modalItem.images && modalItem.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {modalItem.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveModalImage(img)}
                        className={`w-16 h-16 shrink-0 border overflow-hidden transition-all ${
                          activeModalImage === img ? 'border-white' : 'border-[#333] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Garment Information */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] bg-[#141414] px-2 py-0.5 border border-[#242424]">
                      {modalItem.category}
                    </span>
                    {modalItem.inStock ? (
                      <span className="text-[10px] font-mono text-[#4ADE80]">IN STOCK</span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#F87171]">SOLD OUT</span>
                    )}
                  </div>

                  <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                    {modalItem.name}
                  </h2>

                  <div className="text-2xl font-black font-mono text-white mt-2">
                    {modalItem.currency || '$'}{modalItem.price}
                  </div>
                </div>

                <div className="border-t border-[#1F1F1F] pt-4">
                  <p className="text-xs text-[#A1A1A1] leading-relaxed whitespace-pre-line font-mono">
                    {modalItem.description || 'Exclusive underground collection garment. Premium heavy material designed with durable detailing.'}
                  </p>
                </div>

                {/* Size Selection */}
                {modalItem.sizes && modalItem.sizes.length > 0 && (
                  <div className="space-y-2 border-t border-[#1F1F1F] pt-4">
                    <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                      <span>AVAILABLE SIZES</span>
                      <span className="text-white font-bold">
                        {selectedSizes[modalItem.id] || modalItem.sizes[0]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {modalItem.sizes.map(sz => {
                        const isSelected = (selectedSizes[modalItem.id] || modalItem.sizes[0]) === sz;
                        return (
                          <button
                            key={sz}
                            onClick={() => handleSelectSize(modalItem.id, sz)}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider cursor-pointer ${
                              isSelected
                                ? 'bg-white text-black font-bold border border-white'
                                : 'bg-[#141414] text-[#888] hover:text-white border border-[#2B2B2B]'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Buttons */}
                <div className="space-y-2 pt-4">
                  {modalItem.inStock ? (
                    <>
                      <button
                        onClick={() => handleWhatsAppOrder(modalItem)}
                        className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#3A3A3A] hover:border-white py-3 px-4 text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <span>Order Directly on WhatsApp</span>
                      </button>

                      {modalItem.orderUrl && (
                        <a
                          href={modalItem.orderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white hover:bg-[#E5E5E5] text-black py-3 px-4 text-xs uppercase font-black tracking-wider transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Go to Online Store</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-[#121212] border border-[#222] text-center text-xs font-mono text-[#666]">
                      THIS ITEM IS CURRENTLY SOLD OUT
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
