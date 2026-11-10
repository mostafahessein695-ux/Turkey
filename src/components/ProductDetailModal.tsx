import React, { useState, useEffect } from 'react';
import { MerchItem } from '../types';
import { useCart } from '../context/CartContext';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Ruler, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Plus, 
  Minus,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ProductDetailModalProps {
  product: MerchItem | null;
  allProducts: MerchItem[];
  onClose: () => void;
  onSelectOtherProduct: (product: MerchItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  onSelectOtherProduct,
}) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedColor((product.colors && product.colors[0]) || 'Black');
      setSelectedSize((product.sizes && product.sizes[0]) || 'M');
      setQuantity(1);
      setActiveImageIndex(0);
      setIsAdded(false);
      setShowSizeGuide(false);
    }
  }, [product]);

  if (!product) return null;

  // Construct images list
  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.coverImage];

  // If a color image is selected, prioritize it
  const currentColorImage = product.colorImages && product.colorImages[selectedColor];
  const activeImage = currentColorImage || allImages[activeImageIndex] || product.coverImage;

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Find 3 related products in same category or featured
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.isFeatured))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-4xl liquid-glass-panel rounded-3xl p-6 sm:p-10 my-auto shadow-2xl border border-white/15 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 sm:p-2 text-[#888888] hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition-all cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.isNewArrival && (
                  <span className="px-3 py-1 bg-white text-black text-[11px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-md">
                    New Drop
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1 bg-black/80 text-white text-[11px] font-bold uppercase tracking-wider rounded-md border border-white/20 backdrop-blur-md shadow-md">
                    Best Seller
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Switcher */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx && !currentColorImage
                        ? 'border-white scale-105 shadow-md'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Narrative & Buy Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stock */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#888888]">
                <span>TURVEX &bull; {product.category}</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready to Dispatch</span>
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-snug">
                  {product.name}
                </h1>
                <p className="text-2xl font-black font-mono text-white mt-2">
                  {product.price} <span className="text-sm font-normal text-[#A1A1A1]">{product.currency || 'EGP'}</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed font-light">
                {product.description}
              </p>

              {/* Garment Details & Tech Specs */}
              {product.details && product.details.length > 0 && (
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#707070] font-mono block">
                    Garment Engineering
                  </span>
                  <ul className="space-y-1.5">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-[#D0D0D0] flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#888888] uppercase tracking-wider font-mono">
                      Colorway:
                    </span>
                    <span className="text-white font-medium">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(col => {
                      const isSelected = selectedColor === col;
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`px-3.5 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black font-bold border-white shadow-md'
                              : 'bg-white/5 text-[#CCCCCC] border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection & Size Guide */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#888888] uppercase tracking-wider font-mono">
                    Select Size:
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-[#A1A1A1] hover:text-white flex items-center gap-1 transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map(size => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-md'
                            : 'bg-white/5 text-[#CCCCCC] border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-[#888888] uppercase tracking-wider font-mono">
                  Quantity:
                </span>
                <div className="flex items-center gap-3 bg-white/5 border border-white/15 px-3 py-1.5 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#A1A1A1] hover:text-white p-0.5 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-mono font-bold text-white px-2">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#A1A1A1] hover:text-white p-0.5 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions: Add to Cart */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 px-6 bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_15px_35px_rgba(255,255,255,0.2)] cursor-pointer active:scale-[0.98]"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Added to Your Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag &bull; {product.price * quantity} {product.currency || 'EGP'}</span>
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#707070] text-center font-mono">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#999999]" />
                  <span>Fast 48H Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-[#999999]" />
                  <span>14-Day Exchange</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#999999]" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide Modal Overlay */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md liquid-glass-panel rounded-2xl p-6 border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  <span>TURVEX Streetwear Fit Guide</span>
                </h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="p-1 text-[#888888] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                All garments feature our signature dropped-shoulder oversized boxy fit. If you prefer a tailored fit, we recommend ordering one size down.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-[#707070]">
                      <th className="py-2">Size</th>
                      <th className="py-2">Chest (cm)</th>
                      <th className="py-2">Length (cm)</th>
                      <th className="py-2">Shoulder (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#CCCCCC]">
                    <tr>
                      <td className="py-2 font-bold text-white">S</td>
                      <td className="py-2">116</td>
                      <td className="py-2">70</td>
                      <td className="py-2">56</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">M</td>
                      <td className="py-2">122</td>
                      <td className="py-2">73</td>
                      <td className="py-2">58</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">L</td>
                      <td className="py-2">128</td>
                      <td className="py-2">76</td>
                      <td className="py-2">60</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">XL</td>
                      <td className="py-2">134</td>
                      <td className="py-2">78</td>
                      <td className="py-2">62</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">XXL</td>
                      <td className="py-2">140</td>
                      <td className="py-2">80</td>
                      <td className="py-2">64</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/90 cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}

        {/* Related Streetwear Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#888888] font-mono">
              Complete The Capsule Look
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectOtherProduct(rel)}
                  className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all group"
                >
                  <img
                    src={rel.coverImage}
                    alt={rel.name}
                    className="w-14 h-16 object-cover rounded-xl shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-white">
                      {rel.name}
                    </p>
                    <p className="text-xs font-mono font-bold text-[#A1A1A1] mt-1">
                      {rel.price} {rel.currency || 'EGP'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#707070] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
