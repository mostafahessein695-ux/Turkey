import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CustomerOrder, NavTab } from '../types';
import { createCustomerOrder } from '../services/db';
import { 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  CreditCard, 
  ShoppingBag, 
  AlertCircle,
  Copy,
  Check,
  Phone
} from 'lucide-react';

interface CheckoutPageProps {
  onBackToShop: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

const EGYPT_GOVERNORATES = [
  'Cairo (القاهرة)',
  'Giza (الجيزة)',
  'Alexandria (الإسكندرية)',
  'Qalyubia (القليوبية)',
  'Sharqia (الشرقية)',
  'Dakahlia (الدقهلية)',
  'Gharbia (الغربية)',
  'Monufia (المنوفية)',
  'Beheira (البحيرة)',
  'Kafr El Sheikh (كفر الشيخ)',
  'Damietta (دمياط)',
  'Port Said (بورسعيد)',
  'Ismailia (الإسماعيلية)',
  'Suez (السويس)',
  'Red Sea (البحر الأحمر - الغردقة)',
  'South Sinai (شرم الشيخ / دهب)',
  'Fayoum (الفيوم)',
  'Beni Suef (بني سويف)',
  'Minya (المنيا)',
  'Asyut (أسيوط)',
  'Sohag (سوهاج)',
  'Qena (قنا)',
  'Luxor (الأقصر)',
  'Aswan (أسوان)',
  'Other / International'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToShop,
  onNavigateTab,
}) => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'InstaPay / Mobile Wallet'>('Cash on Delivery');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in all required shipping fields (Name, Phone, Governorate, City, Address).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate clean order code e.g. TRVX-73921
      const orderNumber = `TRVX-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderPayload = {
        orderNumber,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || 'unspecified@turvex.store',
        governorate,
        city: city.trim(),
        address: address.trim(),
        notes: notes.trim(),
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          image: (item.product.colorImages && item.product.colorImages[item.color]) || item.product.coverImage,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        status: 'pending' as const,
      };

      const saved = await createCustomerOrder(orderPayload);
      setCompletedOrder(saved);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      setError('Failed to process your order. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderNumber);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (completedOrder) {
    const whatsappText = encodeURIComponent(
      `Hello TURVEX Studio! I just placed an order:\n\nOrder Code: ${completedOrder.orderNumber}\nCustomer: ${completedOrder.customerName}\nPhone: ${completedOrder.customerPhone}\nGovernorate: ${completedOrder.governorate}\nCity: ${completedOrder.city}\nTotal: ${completedOrder.total} EGP (${completedOrder.paymentMethod})\n\nPlease confirm dispatch!`
    );
    const whatsappLink = `https://wa.me/201000000000?text=${whatsappText}`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-24 sm:py-32">
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-12 border border-white/20 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#707070] font-mono">
              Order Confirmed & Received
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Thank You, {completedOrder.customerName.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-md mx-auto leading-relaxed">
              Your TURVEX garment order has been logged into our studio dispatch queue. Our team will verify and prepare your parcel for courier pickup.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto flex items-center justify-between gap-3 font-mono">
            <div className="text-left">
              <span className="text-[10px] uppercase text-[#707070] block">
                Order Tracking Code
              </span>
              <span className="text-lg font-bold text-white tracking-widest">
                {completedOrder.orderNumber}
              </span>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOrderId ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Order Details Summary */}
          <div className="text-left bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md mx-auto space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
              Parcel Destination
            </h4>
            <div className="space-y-1 text-[#CCCCCC]">
              <p><strong className="text-white">Recipient:</strong> {completedOrder.customerName}</p>
              <p><strong className="text-white">Phone:</strong> {completedOrder.customerPhone}</p>
              <p><strong className="text-white">Address:</strong> {completedOrder.address}, {completedOrder.city}, {completedOrder.governorate}</p>
              <p><strong className="text-white">Payment:</strong> {completedOrder.paymentMethod}</p>
              <p><strong className="text-white">Total Amount:</strong> <span className="font-bold font-mono text-white text-sm">{completedOrder.total} EGP</span></p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3 px-5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Confirm on WhatsApp</span>
            </a>

            <button
              onClick={() => onNavigateTab('shop')}
              className="w-full sm:flex-1 py-3 px-5 bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#707070]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            Your Bag is Empty
          </h1>
          <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
            Please add your chosen TURVEX pieces before proceeding to checkout.
          </p>
        </div>
        <button
          onClick={onBackToShop}
          className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white/90 transition-all cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs text-[#888888] hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Customer & Shipping Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#707070]">
                Express Direct Checkout
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mt-1">
                Shipping & Contact Information
              </h2>
            </div>

            {error && (
              <div className="p-3 bg-[#1C0F0F] border border-[#4D1D1D] rounded-xl flex items-start gap-2.5 text-xs text-[#FF9999]">
                <AlertCircle className="w-4 h-4 text-[#FF6666] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                  Full Name / الاسم بالكامل <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mostafa Hussein"
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#555555] outline-none transition-colors"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                    Phone / رقم الهاتف <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01012345678"
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#555555] outline-none transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#555555] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Governorate & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                    Governorate / المحافظة <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/15 focus:border-white rounded-xl text-xs text-white outline-none cursor-pointer"
                  >
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov} className="bg-[#111111] text-white">
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                    City / المنطقة / الحي <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Cairo / Tagamoa / Sheikh Zayed"
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#555555] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                  Detailed Address / العنوان بالتفصيل <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, building number, apartment, floor"
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#555555] outline-none transition-colors"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-mono block">
                  Delivery Notes / ملاحظات التوصيل (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for the courier, preferred timing, etc."
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 focus:border-white rounded-xl text-xs text-white placeholder-[#555555] outline-none transition-colors resize-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] font-mono block">
                  Payment Method / طريقة الدفع
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'bg-white/15 border-white text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-[#888888] hover:border-white/20'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">
                        Cash on Delivery
                      </p>
                      <p className="text-[10px] text-[#A1A1A1]">الدفع كاش عند الاستلام</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('InstaPay / Mobile Wallet')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === 'InstaPay / Mobile Wallet'
                        ? 'bg-white/15 border-white text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-[#888888] hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">
                        InstaPay / Wallet
                      </p>
                      <p className="text-[10px] text-[#A1A1A1]">انستاباي أو المحافظ الإلكترونية</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-white hover:bg-white/95 text-black text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_15px_35px_rgba(255,255,255,0.2)] cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Securing Order...' : `Place Order &bull; ${total} EGP`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 border border-white/15 shadow-2xl space-y-5 sticky top-28">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white pb-3 border-b border-white/10 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="font-mono text-xs text-[#888888]">{items.length} Unique Pieces</span>
            </h3>

            {/* Items scroll */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map(item => {
                const itemImg = (item.product.colorImages && item.product.colorImages[item.color]) || item.product.coverImage;
                return (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <img
                      src={itemImg}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover rounded-xl border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{item.product.name}</p>
                      <p className="text-[11px] text-[#888888] font-mono mt-0.5">
                        {item.color} &bull; Size {item.size} &bull; Qty {item.quantity}
                      </p>
                      <p className="font-mono font-bold text-white mt-1">
                        {item.product.price * item.quantity} EGP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between text-[#A1A1A1]">
                <span>Subtotal</span>
                <span className="font-mono text-white font-medium">{subtotal} EGP</span>
              </div>
              <div className="flex items-center justify-between text-[#A1A1A1]">
                <span>Standard Delivery Fee</span>
                <span className="font-mono text-white">
                  {deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `${deliveryFee} EGP`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm font-bold text-white">
                <span>Grand Total</span>
                <span className="font-mono text-lg text-white">{total} EGP</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-[#888888] space-y-1 font-mono">
              <p className="text-white font-medium">TURVEX Studio Guarantee</p>
              <p>Inspected before packaging. 14 days exchange window if unworn with tags attached.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
