import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreProducts,
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop with realistic blur */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Cart Panel with Apple Liquid Glass aesthetics */}
      <div className="relative w-full max-w-md h-full liquid-glass-panel p-6 sm:p-7 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Shopping Bag ({totalCount})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-[#707070] hover:text-white transition-colors cursor-pointer mr-2"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#A1A1A1] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping indicator banner */}
        <div className="py-2.5 px-3.5 my-3 bg-white/5 border border-white/10 text-xs text-[#CCCCCC] flex items-center justify-between rounded-lg">
          {subtotal >= 1500 ? (
            <span className="text-white font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free Delivery Qualified!</span>
            </span>
          ) : (
            <span>
              Add <strong className="text-white font-mono">{1500 - subtotal} EGP</strong> for Free Shipping
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-[#707070]">Domestic</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#707070]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-wider text-white">
                  Your bag is empty
                </p>
                <p className="text-xs text-[#888888] max-w-xs leading-relaxed">
                  Explore our limited heavyweight drops, acid-washed garments, and minimal silhouettes.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onExploreProducts();
                }}
                className="px-6 py-2.5 bg-white text-[#050505] text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all cursor-pointer rounded-full"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map(item => {
              // Resolve image based on color swatch if available
              const displayImage =
                (item.product.colorImages && item.product.colorImages[item.color]) ||
                item.product.coverImage;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#111111] border border-white/10 rounded-lg overflow-hidden shrink-0 relative">
                    <img
                      src={displayImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-semibold text-white truncate leading-snug">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#707070] hover:text-[#FF7777] p-1 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#888888] font-mono">
                        <span>Color: <strong className="text-[#E0E0E0]">{item.color}</strong></span>
                        <span>·</span>
                        <span>Size: <strong className="text-[#E0E0E0]">{item.size}</strong></span>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold font-mono text-white">
                        {item.product.price} {item.product.currency || 'EGP'}
                      </span>

                      <div className="flex items-center gap-2 bg-white/5 border border-white/15 px-2 py-0.5 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-[#A1A1A1] hover:text-white p-0.5 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-medium text-white px-1.5 min-w-[1.2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-[#A1A1A1] hover:text-white p-0.5 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {items.length > 0 && (
          <div className="pt-5 border-t border-white/10 space-y-3.5">
            <div className="space-y-1.5 text-xs text-[#A1A1A1]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white font-medium">{subtotal} EGP</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Shipping</span>
                <span className="font-mono text-[#CCCCCC]">
                  {deliveryFee === 0 ? 'FREE' : `${deliveryFee} EGP`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Total</span>
                <span className="font-mono text-base">{total} EGP</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-5 bg-white text-[#050505] hover:bg-white/90 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-[#666666] text-center font-mono">
              CASH ON DELIVERY &bull; FREE EXCHANGE WITHIN 14 DAYS
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
