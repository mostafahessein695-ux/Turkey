import React from 'react';
import { MerchItem } from '../types';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';

interface CollectionsPageProps {
  products: MerchItem[];
  onNavigateToShopWithCategory?: (category: string) => void;
  onOpenProductDetail: (product: MerchItem) => void;
}

interface StreetwearCollection {
  id: string;
  title: string;
  season: string;
  tagline: string;
  description: string;
  heroImage: string;
  categoryFilter: string;
  piecesCount: number;
}

const CAPSULES: StreetwearCollection[] = [
  {
    id: 'capsule_heavyweight',
    title: 'Capsule 01: The Heavyweight Foundation',
    season: 'Permanent Drop',
    tagline: '480GSM & 500GSM Boxy Silhouettes',
    description: 'Constructed from custom-spun 100% combed organic French terry and loopback fleece. Cut with an exaggerated drop shoulder and double-lined hood with zero drawstrings for pure minimalist architecture.',
    heroImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1400&q=85',
    categoryFilter: 'hoodies',
    piecesCount: 4,
  },
  {
    id: 'capsule_acid_wash',
    title: 'Capsule 02: Acid Wash & Mineral Patina',
    season: 'Autumn / Winter',
    tagline: '280GSM Hand-Washed Combed Cotton',
    description: 'Each piece undergoes a 4-stage mineral stone wash, creating unique distressed grey and chalk patinas that age with character. Finished with raw blind hems and thick reinforced collars.',
    heroImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=85',
    categoryFilter: 'tees',
    piecesCount: 3,
  },
  {
    id: 'capsule_tactical',
    title: 'Capsule 03: Tactical Movement & Cargo',
    season: 'Limited Series',
    tagline: '450GSM Fleece & Ballistic Cordura',
    description: 'Engineered for seamless transit. Wide-leg pooling sweatpants with internal bungee toggles, combined with waterproof 1000D Cordura utility crossbodies featuring German magnetic hardware.',
    heroImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1400&q=85',
    categoryFilter: 'pants',
    piecesCount: 3,
  },
  {
    id: 'capsule_monochrome',
    title: 'Capsule 04: Dark Luxury Headwear',
    season: 'Core Accessories',
    tagline: 'Sculpted Foam & Merino Lambswool',
    description: '3D embroidered curved-brim trucker caps and double-layered ribbed lambswool beanies with laser-engraved metal bars. The final touch of quiet streetwear sophistication.',
    heroImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1400&q=85',
    categoryFilter: 'headwear',
    piecesCount: 2,
  },
];

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  products,
  onNavigateToShopWithCategory,
  onOpenProductDetail,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-28 sm:py-36 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl text-center sm:text-left">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#888888] font-mono block">
          Editorial Archives &bull; Limited Runs
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          TURVEX Capsules
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed font-light">
          Seasonal and permanent design chapters exploring weight, drape, and material longevity. Each capsule is engineered in small batches to preserve craftsmanship and avoid excess.
        </p>
      </div>

      {/* Capsules Stack */}
      <div className="space-y-12">
        {CAPSULES.map((capsule, idx) => {
          // Find matching products in this category
          const matchingProducts = products
            .filter(p => p.category.toLowerCase() === capsule.categoryFilter.toLowerCase())
            .slice(0, 3);

          return (
            <div
              key={capsule.id}
              className="liquid-glass-card rounded-3xl overflow-hidden border border-white/10 p-6 sm:p-10 space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Hero Showcase Image */}
                <div className="lg:col-span-7 relative aspect-[16/10] bg-[#0A0A0A] rounded-2xl overflow-hidden border border-white/10 group">
                  <img
                    src={capsule.heroImage}
                    alt={capsule.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#CCCCCC] font-mono block">
                        {capsule.season}
                      </span>
                      <p className="text-sm font-bold uppercase text-white mt-0.5">
                        {capsule.tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Narrative & Action */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#707070]">
                      Series 0{idx + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                      {capsule.title}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed font-light">
                    {capsule.description}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigateToShopWithCategory?.(capsule.categoryFilter)}
                      className="px-6 py-3 bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-widest rounded-xl inline-flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                    >
                      <span>Explore {capsule.title.split(':')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Garments in this capsule */}
              {matchingProducts.length > 0 && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#707070]">
                    <span>Featured Pieces in This Capsule</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {matchingProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => onOpenProductDetail(p)}
                        className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all group"
                      >
                        <img
                          src={p.coverImage}
                          alt={p.name}
                          className="w-14 h-16 object-cover rounded-xl border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                          <p className="text-xs font-mono font-bold text-[#CCCCCC] mt-1">
                            {p.price} {p.currency || 'EGP'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#707070] group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
