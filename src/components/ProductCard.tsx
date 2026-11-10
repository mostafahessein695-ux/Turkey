import React, { useState } from 'react';
import { MerchItem } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: MerchItem;
  onOpenDetail: (product: MerchItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
}) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors[0] ? product.colors[0] : 'Black'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes[0] ? product.sizes[0] : 'M'
  );
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic image switching based on selected color or secondary image on hover
  const colorImage = product.colorImages && product.colorImages[selectedColor];
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : null;
  const currentImage = colorImage || (isHovered && secondaryImage ? secondaryImage : product.coverImage);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedColor, selectedSize, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setShowQuickAdd(false);
    }, 1500);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
      className="group relative flex flex-col liquid-glass-card rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Visual Canvas / Image Container */}
      <div className="relative aspect-[3/4] bg-[#0E0E0E] overflow-hidden">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Minimal Badges (New Arrival / Best Seller) */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 bg-white/90 text-[#050505] text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md border border-white/15 shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Floating Quick Action overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2">
          {showQuickAdd ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="p-3 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-[#A1A1A1]">
                  Select Size
                </span>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="text-[10px] text-[#707070] hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Sizes Row */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handleQuickAdd}
                className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 hover:bg-white/90 transition-all cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Confirm Add</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickAdd(true);
                }}
                className="flex-1 py-2.5 px-3 bg-white/90 hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(product);
                }}
                className="p-2.5 bg-black/60 hover:bg-black/90 text-white border border-white/20 rounded-xl backdrop-blur-md transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Metadata & Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#707070] font-mono uppercase tracking-wider">
            <span>{product.category}</span>
            <span>{product.inStock ? 'In Stock' : 'Sold Out'}</span>
          </div>
          <h3 className="text-sm font-semibold text-white tracking-wide group-hover:text-white transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm font-bold font-mono text-[#F0F0F0]">
            {product.price} {product.currency || 'EGP'}
          </p>
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pt-1 border-t border-white/5"
          >
            <span className="text-[10px] text-[#707070] uppercase tracking-wider font-mono mr-1">
              {selectedColor}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {product.colors.map(color => {
                const isSelected = selectedColor === color;
                // Determine swatch color
                let bgClass = 'bg-[#181818]';
                const lower = color.toLowerCase();
                if (lower.includes('white') || lower.includes('bone') || lower.includes('chalk')) bgClass = 'bg-[#EAEAEA]';
                else if (lower.includes('grey') || lower.includes('gray') || lower.includes('charcoal') || lower.includes('concrete')) bgClass = 'bg-[#555555]';
                else if (lower.includes('clay') || lower.includes('sand') || lower.includes('taupe')) bgClass = 'bg-[#8C7A6B]';
                else if (lower.includes('olive') || lower.includes('moss') || lower.includes('green')) bgClass = 'bg-[#4B5320]';
                else if (lower.includes('rust')) bgClass = 'bg-[#8B3A2B]';

                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-3.5 h-3.5 rounded-full ${bgClass} transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0A] scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
