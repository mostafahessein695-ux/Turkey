import React, { useState } from 'react';
import { 
  MerchItem,
  SiteSettings, 
  Song,
  Artist,
  Album,
  Collection,
  GalleryItem,
  Quote
} from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  saveMerchItem,
  deleteMerchItem,
  saveSiteSettings
} from '../services/db';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Upload, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  ShoppingBag,
  Tag,
  Sliders,
  LayoutDashboard,
  Check,
  PhoneCall,
  ExternalLink,
  PackageCheck,
  PackageX,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  merch: MerchItem[];
  settings: SiteSettings;
  onRefreshData: () => Promise<void>;
  songs?: Song[];
  artists?: Artist[];
  albums?: Album[];
  collections?: Collection[];
  gallery?: GalleryItem[];
  quotes?: Quote[];
}

type AdminSection = 'dashboard' | 'merch' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  merch,
  settings,
  onRefreshData,
}) => {
  const { user, logout, adminEmail } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // EDIT STATE FOR MERCH
  const [editingMerch, setEditingMerch] = useState<Partial<MerchItem> | null>(null);
  const [merchSizeInput, setMerchSizeInput] = useState('');
  const [merchImageInput, setMerchImageInput] = useState('');
  const [editableSettings, setEditableSettings] = useState<SiteSettings>(settings);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const parseErrorMessage = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes('permission') || raw.includes('Missing or insufficient permissions')) {
      return `Database write restricted. Please sign in with your Google Account (${adminEmail}) to authorize edits.`;
    }
    return raw;
  };

  // IMAGE UPLOADER HELPER
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotification('File exceeds 2MB limit. Please choose a smaller image or use a URL.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploaded(reader.result);
        showNotification('Image uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const secondImage = editingMerch?.images?.[0] || '';
  const handleSetSecondImage = (url: string) => {
    if (!editingMerch) return;
    const remaining = (editingMerch.images || []).slice(1);
    const trimmed = url;
    if (trimmed) {
      setEditingMerch({
        ...editingMerch,
        images: [trimmed, ...remaining],
      });
    } else {
      setEditingMerch({
        ...editingMerch,
        images: remaining,
      });
    }
  };

  // ADD / REMOVE SIZE HELPER
  const handleAddSize = () => {
    const s = merchSizeInput.trim().toUpperCase();
    if (!s || !editingMerch) return;
    const currentSizes = editingMerch.sizes ? [...editingMerch.sizes] : [];
    if (!currentSizes.includes(s)) {
      currentSizes.push(s);
    }
    setEditingMerch({ ...editingMerch, sizes: currentSizes });
    setMerchSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (!editingMerch || !editingMerch.sizes) return;
    setEditingMerch({
      ...editingMerch,
      sizes: editingMerch.sizes.filter(s => s !== sizeToRemove),
    });
  };

  // ADD / REMOVE EXTRA IMAGE HELPER
  const handleAddExtraImage = () => {
    const url = merchImageInput.trim();
    if (!url || !editingMerch) return;
    const currentImages = editingMerch.images ? [...editingMerch.images] : [];
    if (!currentImages.includes(url)) {
      currentImages.push(url);
    }
    setEditingMerch({ ...editingMerch, images: currentImages });
    setMerchImageInput('');
  };

  const handleRemoveExtraImage = (indexToRemove: number) => {
    if (!editingMerch || !editingMerch.images) return;
    setEditingMerch({
      ...editingMerch,
      images: editingMerch.images.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // SAVE MERCH
  const handleSaveMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerch || !editingMerch.name || !editingMerch.coverImage) {
      showNotification('Garment name and front cover image are required', 'error');
      return;
    }

    setSaving(true);
    try {
      // Gather images: Image 2 first, then any extra angles
      const gatheredImages: string[] = [];
      if (secondImage.trim()) {
        gatheredImages.push(secondImage.trim());
      }
      if (editingMerch.images && editingMerch.images.length > 1) {
        editingMerch.images.slice(1).forEach(img => {
          if (img && img.trim() && !gatheredImages.includes(img.trim())) {
            gatheredImages.push(img.trim());
          }
        });
      }

      const itemToSave: MerchItem = {
        id: editingMerch.id || `merch_${Date.now()}`,
        name: editingMerch.name.trim(),
        price: Number(editingMerch.price) || 0,
        currency: editingMerch.currency?.trim() || 'EGP',
        category: editingMerch.category || 'hoodies',
        description: editingMerch.description || '',
        coverImage: editingMerch.coverImage.trim(),
        images: gatheredImages,
        sizes: editingMerch.sizes && editingMerch.sizes.length > 0 ? editingMerch.sizes : ['S', 'M', 'L', 'XL'],
        inStock: editingMerch.inStock ?? true,
        isFeatured: editingMerch.isFeatured ?? false,
        isPublished: editingMerch.isPublished ?? true,
        orderUrl: editingMerch.orderUrl?.trim() || '',
        whatsappNumber: editingMerch.whatsappNumber?.trim() || '+201000000000',
        createdAt: editingMerch.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveMerchItem(itemToSave);
      await onRefreshData();
      setEditingMerch(null);
      showNotification('Garment saved to store successfully');
    } catch (err) {
      console.error(err);
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  // DELETE MERCH
  const handleDeleteMerch = async (id: string) => {
    if (!window.confirm('Delete this garment from the store?')) return;
    try {
      await deleteMerchItem(id);
      await onRefreshData();
      showNotification('Garment deleted successfully');
    } catch (err) {
      console.error(err);
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // TOGGLE IN-STOCK QUICK ACTION
  const handleToggleMerchStock = async (item: MerchItem) => {
    try {
      const updated: MerchItem = {
        ...item,
        inStock: !item.inStock,
        updatedAt: new Date().toISOString(),
      };
      await saveMerchItem(updated);
      await onRefreshData();
      showNotification(`${item.name} stock status updated to: ${updated.inStock ? 'In Stock' : 'Sold Out'}`);
    } catch (err) {
      console.error(err);
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // SAVE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings(editableSettings);
      await onRefreshData();
      showNotification('Site settings updated successfully');
    } catch (err) {
      console.error(err);
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const inStockCount = merch.filter(m => m.inStock).length;
  const soldOutCount = merch.length - inStockCount;
  const featuredCount = merch.filter(m => m.isFeatured).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#707070] mb-1 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Store Admin & Brand Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F5F5]">
            MY WORLD — Store Dashboard
          </h1>
          <p className="text-xs text-[#707070] font-mono mt-1">
            Logged in as: <span className="text-white font-medium">{user?.email || adminEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRefreshData()}
            className="px-3.5 py-2 bg-[#111111] border border-[#242424] hover:border-[#707070] text-[#A1A1A1] hover:text-[#F5F5F5] text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload latest data from Firestore"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 bg-[#161616] border border-[#242424] hover:border-red-900/60 text-[#A1A1A1] hover:text-[#F5F5F5] text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className={`p-4 border text-xs flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-[#0B0B0B] border-[#404040] text-[#F5F5F5]' 
            : 'bg-[#140808] border-[#552020] text-[#FFAAAA]'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Responsive Layout with Admin Left Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Admin Left Sidebar */}
        <aside className="lg:col-span-3 bg-[#0B0B0B] border border-[#242424] p-3 sticky top-6 space-y-1">
          <div className="px-3 py-2 border-b border-[#1C1C1C] mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#707070] font-mono block">
              Control Panel
            </span>
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider block mt-0.5">
              Brand & Store
            </span>
          </div>

          {[
            { id: 'dashboard' as AdminSection, label: 'Store Overview', count: undefined, icon: LayoutDashboard },
            { id: 'merch' as AdminSection, label: 'Store Products', count: merch.length, icon: ShoppingBag },
            { id: 'settings' as AdminSection, label: 'Brand & Settings', count: undefined, icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#141414] text-[#F5F5F5] font-semibold border-l-2 border-white pl-2.5'
                    : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#0F0F0F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#707070]'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-mono tabular-nums text-[#666666]">{tab.count}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Admin Content Area */}
        <div className="lg:col-span-9 space-y-6">

          {/* ================= SECTION: STORE DASHBOARD OVERVIEW ================= */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#707070] block mb-1">
                  Store Metrics
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F5F5F5]">
                  Streetwear & Apparel Status
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveSection('merch')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Total Products</span>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {merch.length}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    All apparel in catalog
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('merch')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-emerald-600/60 p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-400">In Stock</span>
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-emerald-400 tabular-nums font-mono">
                    {inStockCount}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    Available for WhatsApp order
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('merch')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-red-900/60 p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider text-red-400">Sold Out</span>
                    <PackageX className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-3xl font-black text-red-400 tabular-nums font-mono">
                    {soldOutCount}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    Out of stock items
                  </span>
                </div>

                <div 
                  onClick={() => setActiveSection('merch')}
                  className="bg-[#0B0B0B] border border-[#242424] hover:border-[#707070] p-5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[#707070]">
                    <span className="text-[11px] uppercase tracking-wider">Featured Drops</span>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-3xl font-black text-[#F5F5F5] tabular-nums font-mono">
                    {featuredCount}
                  </div>
                  <span className="text-[10px] text-[#707070] block">
                    Highlighted on Homepage
                  </span>
                </div>
              </div>

              {/* Quick Actions & Store Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-white" />
                    <span>Quick Store Management</span>
                  </h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    Add new limited hoodies, graphic tees, caps, and outerwear. Set prices in EGP and connect your WhatsApp order number.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setActiveSection('merch');
                        setEditingMerch({
                          name: '',
                          price: 750,
                          currency: 'EGP',
                          category: 'hoodies',
                          description: 'Heavyweight French Terry cotton. Relaxed boxy fit.',
                          coverImage: '',
                          images: [],
                          sizes: ['S', 'M', 'L', 'XL'],
                          inStock: true,
                          isFeatured: true,
                          isPublished: true,
                          whatsappNumber: '+201000000000',
                          orderUrl: '',
                        });
                      }}
                      className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#E5E5E5] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Garment</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('merch')}
                      className="px-4 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] text-xs font-medium uppercase tracking-wider text-white transition-colors cursor-pointer"
                    >
                      View All Products ({merch.length})
                    </button>
                  </div>
                </div>

                <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>Ordering Channel</span>
                  </h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    Customer orders are routed through WhatsApp with predefined product details, selected size, and price for fast fulfillment.
                  </p>
                  <div className="p-3 bg-[#111111] border border-[#1E1E1E] text-xs font-mono text-[#A1A1A1] flex items-center justify-between">
                    <span>Default Currency: <strong className="text-white">EGP</strong></span>
                    <span className="text-emerald-400">Direct WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Latest Garments List */}
              <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Recent Garment Inventory
                  </h3>
                  <button
                    onClick={() => setActiveSection('merch')}
                    className="text-xs text-[#707070] hover:text-white uppercase tracking-wider font-mono cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                <div className="divide-y divide-[#1C1C1C]">
                  {merch.slice(0, 5).map(item => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={item.coverImage} alt={item.name} className="w-10 h-10 object-cover border border-[#242424] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                          <p className="text-[11px] text-[#707070] font-mono">{item.price} {item.currency || 'EGP'} · {item.category}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                        item.inStock ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' : 'border-red-900 text-red-400 bg-red-950/40'
                      }`}>
                        {item.inStock ? 'IN STOCK' : 'SOLD OUT'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION: STORE PRODUCTS MANAGER ================= */}
          {activeSection === 'merch' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-white" />
                    <span>Store Products Manager</span>
                  </h2>
                  <p className="text-xs text-[#707070] font-mono mt-0.5">
                    Add streetwear pieces, manage pricing in EGP, inventory stock, and direct WhatsApp sales.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMerch({
                      name: '',
                      price: 750,
                      currency: 'EGP',
                      category: 'hoodies',
                      description: '450 GSM Heavyweight Terry Cotton. Boxy fit.',
                      coverImage: '',
                      images: [],
                      sizes: ['S', 'M', 'L', 'XL'],
                      inStock: true,
                      isFeatured: false,
                      isPublished: true,
                      whatsappNumber: '+201000000000',
                      orderUrl: '',
                    });
                    setMerchSizeInput('');
                    setMerchImageInput('');
                  }}
                  className="px-4 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Garment</span>
                </button>
              </div>

              {/* Garment Edit / Create Form */}
              {editingMerch && (
                <div className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                      <Tag className="w-4 h-4 text-white" />
                      <span>{editingMerch.id ? 'Edit Garment Piece' : 'Create New Garment Drop'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingMerch(null)}
                      className="text-[#707070] hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMerch} className="space-y-4">
                    {/* 1. Name & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                          Garment / Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingMerch.name || ''}
                          onChange={e => setEditingMerch({ ...editingMerch, name: e.target.value })}
                          placeholder="e.g. OVERSIZED ACID HOODIE, ARCHIVE HEAVY TEE..."
                          className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                          Category
                        </label>
                        <select
                          value={editingMerch.category || 'hoodies'}
                          onChange={e => setEditingMerch({ ...editingMerch, category: e.target.value })}
                          className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        >
                          <option value="hoodies">Hoodies & Sweatshirts</option>
                          <option value="tees">T-Shirts & Tops</option>
                          <option value="outerwear">Jackets & Outerwear</option>
                          <option value="pants">Pants & Bottoms</option>
                          <option value="headwear">Caps & Beanies</option>
                          <option value="accessories">Accessories & Bags</option>
                        </select>
                      </div>
                    </div>

                    {/* 2. Price & Currency & WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={editingMerch.price ?? 0}
                          onChange={e => setEditingMerch({ ...editingMerch, price: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono tabular-nums"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                          Currency Symbol
                        </label>
                        <input
                          type="text"
                          value={editingMerch.currency || 'EGP'}
                          onChange={e => setEditingMerch({ ...editingMerch, currency: e.target.value })}
                          placeholder="EGP"
                          className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                          WhatsApp Phone (Orders)
                        </label>
                        <input
                          type="text"
                          value={editingMerch.whatsappNumber || ''}
                          onChange={e => setEditingMerch({ ...editingMerch, whatsappNumber: e.target.value })}
                          placeholder="+201xxxxxxxxx"
                          className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        />
                      </div>
                    </div>

                    {/* 3. DUAL PRODUCT IMAGES (Front View & Back View) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#1C1C1C]">
                        <label className="text-xs uppercase tracking-wider text-white font-mono font-bold flex items-center gap-2">
                          <Tag className="w-4 h-4 text-emerald-400" />
                          <span>Product Images (Image 1: Front & Image 2: Back)</span>
                        </label>
                        <span className="text-[11px] text-[#A1A1A1] font-mono">
                          Upload 2 Photos: Front View & Back View
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CARD 1: IMAGE 1 (FRONT VIEW / COVER) */}
                        <div className="bg-[#111111] border border-[#262626] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>Image 1: Front View *</span>
                            </span>
                            {editingMerch.coverImage && (
                              <button
                                type="button"
                                onClick={() => setEditingMerch({ ...editingMerch, coverImage: '' })}
                                className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          {/* Image 1 Preview */}
                          <div className="aspect-[4/3] bg-[#0A0A0A] border border-[#222222] relative overflow-hidden flex items-center justify-center">
                            {editingMerch.coverImage ? (
                              <img
                                src={editingMerch.coverImage}
                                alt="Front View Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-4 text-[#555555] space-y-2">
                                <Upload className="w-6 h-6 mx-auto text-[#444444]" />
                                <p className="text-[11px] font-mono text-[#888888]">Front Photo (Required)</p>
                                <p className="text-[10px] font-mono text-[#555555]">Upload photo or paste image URL below</p>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/80 border border-[#333] px-2 py-0.5 text-[9px] font-mono text-emerald-400 uppercase">
                              Front View (الواجهة الأمامية)
                            </div>
                          </div>

                          {/* Image 1 Inputs */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              required
                              value={editingMerch.coverImage || ''}
                              onChange={e => setEditingMerch({ ...editingMerch, coverImage: e.target.value })}
                              placeholder="Image 1 URL or use upload button..."
                              className="w-full bg-[#0B0B0B] border border-[#262626] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                            />
                            <label className="w-full py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-[#2D2D2D] hover:border-emerald-500/60 cursor-pointer text-xs text-white font-mono flex items-center justify-center gap-2 transition-colors">
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Upload Image 1 (Front View)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleImageFileUpload(e, base64 => setEditingMerch({ ...editingMerch, coverImage: base64 }))}
                              />
                            </label>
                          </div>
                        </div>

                        {/* CARD 2: IMAGE 2 (BACK VIEW / SECONDARY) */}
                        <div className="bg-[#111111] border border-[#262626] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              <span>Image 2: Back View (Second Image)</span>
                            </span>
                            {secondImage && (
                              <button
                                type="button"
                                onClick={() => handleSetSecondImage('')}
                                className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          {/* Image 2 Preview */}
                          <div className="aspect-[4/3] bg-[#0A0A0A] border border-[#222222] relative overflow-hidden flex items-center justify-center">
                            {secondImage ? (
                              <img
                                src={secondImage}
                                alt="Back View Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-4 text-[#555555] space-y-2">
                                <Upload className="w-6 h-6 mx-auto text-[#444444]" />
                                <p className="text-[11px] font-mono text-[#888888]">Back Photo (Second Image)</p>
                                <p className="text-[10px] font-mono text-[#555555]">Upload photo or paste image URL below</p>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/80 border border-[#333] px-2 py-0.5 text-[9px] font-mono text-blue-400 uppercase">
                              Back View (الواجهة الخلفية)
                            </div>
                          </div>

                          {/* Image 2 Inputs */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={secondImage || ''}
                              onChange={e => handleSetSecondImage(e.target.value)}
                              placeholder="Image 2 URL or use upload button..."
                              className="w-full bg-[#0B0B0B] border border-[#262626] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                            />
                            <label className="w-full py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-[#2D2D2D] hover:border-blue-500/60 cursor-pointer text-xs text-white font-mono flex items-center justify-center gap-2 transition-colors">
                              <Upload className="w-3.5 h-3.5 text-blue-400" />
                              <span>Upload Image 2 (Back View)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleImageFileUpload(e, base64 => handleSetSecondImage(base64))}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Extra Lookbook Angles / Photos (Optional 3rd & 4th photos) */}
                    <div className="space-y-2 pt-2 border-t border-[#1C1C1C]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-mono">
                          Additional Lookbook Photos / Angles (Optional)
                        </label>
                        <span className="text-[10px] text-[#707070] font-mono">
                          {editingMerch.images && editingMerch.images.length > 1 ? `${editingMerch.images.length - 1} Extra Angles` : '0 Extra'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={merchImageInput}
                          onChange={e => setMerchImageInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddExtraImage();
                            }
                          }}
                          placeholder="Extra angle URL or upload photo..."
                          className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddExtraImage}
                          className="px-3 py-2 bg-[#1E1E1E] border border-[#333333] hover:border-[#707070] text-xs text-white uppercase font-mono cursor-pointer"
                        >
                          Add URL
                        </button>
                        <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1.5 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Angle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageFileUpload(e, base64 => {
                              const cur = editingMerch.images ? [...editingMerch.images] : [];
                              setEditingMerch({ ...editingMerch, images: [...cur, base64] });
                            })}
                          />
                        </label>
                      </div>

                      {editingMerch.images && editingMerch.images.length > 1 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editingMerch.images.slice(1).map((img, idx) => (
                            <div key={idx + 1} className="relative w-16 h-16 border border-[#242424] group">
                              <img src={img} alt="Angle" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveExtraImage(idx + 1)}
                                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 5. Sizes */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                        Available Sizes
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={merchSizeInput}
                          onChange={e => setMerchSizeInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSize();
                            }
                          }}
                          placeholder="Type size (e.g. S, M, L, XL, XXL) and press Add"
                          className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddSize}
                          className="px-4 py-2 bg-[#1E1E1E] border border-[#333333] hover:border-[#707070] text-xs text-white uppercase font-mono cursor-pointer"
                        >
                          Add Size
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {editingMerch.sizes?.map(size => (
                          <span
                            key={size}
                            className="bg-[#161616] border border-[#2A2A2A] px-2.5 py-1 text-xs font-mono text-white flex items-center gap-1.5"
                          >
                            <span>{size}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="text-[#707070] hover:text-red-400 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 6. Description & Fabric */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                        Description & Material Specs
                      </label>
                      <textarea
                        rows={3}
                        value={editingMerch.description || ''}
                        onChange={e => setEditingMerch({ ...editingMerch, description: e.target.value })}
                        placeholder="Material details, GSM weight, cut & fit, washing care instructions..."
                        className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                      />
                    </div>

                    {/* 7. External URL */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                        External Store / Checkout URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={editingMerch.orderUrl || ''}
                        onChange={e => setEditingMerch({ ...editingMerch, orderUrl: e.target.value })}
                        placeholder="https://... (Leave blank to use direct WhatsApp ordering)"
                        className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                      />
                    </div>

                    {/* 8. Flags: In Stock, Featured Drop, Published */}
                    <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#1C1C1C]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5] font-mono">
                        <input
                          type="checkbox"
                          checked={editingMerch.inStock ?? true}
                          onChange={e => setEditingMerch({ ...editingMerch, inStock: e.target.checked })}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                        <span>In Stock (Available to Order)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5] font-mono">
                        <input
                          type="checkbox"
                          checked={editingMerch.isFeatured ?? false}
                          onChange={e => setEditingMerch({ ...editingMerch, isFeatured: e.target.checked })}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                        <span>Featured Drop (Homepage Highlight)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F5] font-mono">
                        <input
                          type="checkbox"
                          checked={editingMerch.isPublished ?? true}
                          onChange={e => setEditingMerch({ ...editingMerch, isPublished: e.target.checked })}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                        <span>Published in Store</span>
                      </label>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242424]">
                      <button
                        type="button"
                        onClick={() => setEditingMerch(null)}
                        className="px-4 py-2 bg-[#161616] text-[#A1A1A1] text-xs font-mono uppercase hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase tracking-wider hover:bg-white flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save Garment'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Garments List Table */}
              <div className="border border-[#242424] divide-y divide-[#1C1C1C] bg-[#0B0B0B]">
                {merch.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-[#707070]">
                    No garments in store yet. Click "Add New Garment" above to create your first piece.
                  </div>
                ) : (
                  merch.map(item => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#111111] transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Two Image Thumbnails (Front & Back) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Image 1: Front */}
                          <div className="relative group/thumb" title="Front Photo">
                            <img
                              src={item.coverImage}
                              alt={item.name}
                              className="w-12 h-12 object-cover border border-[#242424] bg-[#161616]"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[7px] font-mono text-center text-emerald-400 uppercase leading-tight">
                              Front
                            </span>
                          </div>

                          {/* Image 2: Back */}
                          {item.images?.[0] ? (
                            <div className="relative group/thumb" title="Back Photo">
                              <img
                                src={item.images[0]}
                                alt={`${item.name} Back`}
                                className="w-12 h-12 object-cover border border-[#242424] bg-[#161616]"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[7px] font-mono text-center text-blue-400 uppercase leading-tight">
                                Back
                              </span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 border border-dashed border-[#242424] bg-[#0E0E0E] flex flex-col items-center justify-center text-[7px] font-mono text-[#555555] uppercase text-center p-0.5 leading-tight" title="No back photo">
                              <span>No Back</span>
                              <span>Photo</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
                              {item.name}
                            </span>
                            {item.isFeatured && (
                              <span className="bg-white text-black text-[9px] font-black uppercase px-1.5 py-0.5">
                                DROP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-[#707070]">
                            <span className="text-white font-bold">{item.price} {item.currency || 'EGP'}</span>
                            <span>·</span>
                            <span className="uppercase">{item.category}</span>
                            <span>·</span>
                            <span>Sizes: {item.sizes?.join(', ') || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Fast stock toggler */}
                        <button
                          type="button"
                          onClick={() => handleToggleMerchStock(item)}
                          className={`text-[10px] font-mono uppercase px-2.5 py-1 border transition-colors cursor-pointer ${
                            item.inStock
                              ? 'border-[#23582A] text-[#4ADE80] bg-[#122B15] hover:bg-[#1a3d1e]'
                              : 'border-[#582323] text-[#F87171] bg-[#2B1212] hover:bg-[#3d1a1a]'
                          }`}
                        >
                          {item.inStock ? 'IN STOCK' : 'SOLD OUT'}
                        </button>

                        <button
                          onClick={() => setEditingMerch(item)}
                          className="p-2 text-[#707070] hover:text-[#F5F5F5] cursor-pointer"
                          title="Edit Garment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteMerch(item.id)}
                          className="p-2 text-[#707070] hover:text-red-400 cursor-pointer"
                          title="Delete Garment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION: BRAND & SITE SETTINGS ================= */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5]">
                Brand Identity & Site Settings
              </h2>

              <form onSubmit={handleSaveSettings} className="bg-[#0B0B0B] border border-[#242424] p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070] border-b border-[#1F1F1F] pb-2 font-mono">
                    Homepage Hero & Drop Announcement
                  </h3>
                  
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={editableSettings.heroHeadline || ''}
                      onChange={e => setEditableSettings({ ...editableSettings, heroHeadline: e.target.value })}
                      placeholder="MY WORLD. STREETWEAR ARCHIVE."
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Subhead / Drop Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={editableSettings.heroSubhead || ''}
                      onChange={e => setEditableSettings({ ...editableSettings, heroSubhead: e.target.value })}
                      placeholder="Heavyweight knits, bespoke cuts, and limited capsule drops designed for everyday movement."
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Hero Lookbook Backdrop
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editableSettings.heroImage || ''}
                        onChange={e => setEditableSettings({ ...editableSettings, heroImage: e.target.value })}
                        className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-mono"
                      />
                      <label className="px-3 py-2 bg-[#161616] border border-[#242424] hover:border-[#707070] cursor-pointer text-xs text-[#A1A1A1] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileUpload(e, base64 => setEditableSettings({ ...editableSettings, heroImage: base64 }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#1C1C1C]">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#707070] border-b border-[#1F1F1F] pb-2 font-mono">
                    Brand Philosophy & Story
                  </h3>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] mb-1 font-mono">
                      Brand Story
                    </label>
                    <textarea
                      rows={4}
                      value={editableSettings.aboutBio || ''}
                      onChange={e => setEditableSettings({ ...editableSettings, aboutBio: e.target.value })}
                      className="w-full bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] font-light leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-[#242424]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-[#F5F5F5] text-[#050505] text-xs font-bold uppercase hover:bg-white flex items-center gap-2 cursor-pointer tracking-wider"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
