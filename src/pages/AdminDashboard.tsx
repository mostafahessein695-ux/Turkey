import React, { useState, useEffect } from 'react';
import { 
  MerchItem,
  SiteSettings, 
  CustomerOrder,
  WebsiteImages
} from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  saveMerchItem,
  deleteMerchItem,
  saveSiteSettings,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  updateProductImages,
  deleteProductImage,
  updateWebsiteImages
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
  Sparkles,
  ClipboardList,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Search,
  Image as ImageIcon,
  AlertTriangle,
  MoveLeft,
  MoveRight,
  Star,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  merch: MerchItem[];
  settings: SiteSettings;
  onRefreshData: () => Promise<void>;
  songs?: any[];
  artists?: any[];
  albums?: any[];
  collections?: any[];
  gallery?: any[];
  quotes?: any[];
}

type AdminSection = 'dashboard' | 'orders' | 'merch' | 'images' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  merch,
  settings,
  onRefreshData,
}) => {
  const { user, logout, adminEmail } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // ORDERS STATE
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: CustomerOrder['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showNotification(`Order status updated to: ${status}`);
    } catch (err) {
      console.error(err);
      showNotification(parseErrorMessage(err), 'error');
    }
  };

  // CONFIRMATION MODAL STATE FOR DELETIONS
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'merch' | 'order' | 'product_image';
    id: string;
    name: string;
    extraData?: any;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // IMAGE MANAGEMENT STATE
  const [imageSubtab, setImageSubtab] = useState<'website' | 'products'>('website');
  const [selectedProductId, setSelectedProductId] = useState<string>(merch[0]?.id || '');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [savingImages, setSavingImages] = useState(false);

  // Sync selected product if merch changes
  useEffect(() => {
    if (!selectedProductId && merch.length > 0) {
      setSelectedProductId(merch[0].id);
    }
  }, [merch, selectedProductId]);

  const executeConfirmedDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'merch') {
        await deleteMerchItem(deleteTarget.id);
        await onRefreshData();
        showNotification(`Garment "${deleteTarget.name}" deleted from store`);
      } else if (deleteTarget.type === 'order') {
        await deleteOrder(deleteTarget.id);
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
        showNotification(`Order "${deleteTarget.name}" deleted`);
      } else if (deleteTarget.type === 'product_image') {
        const { productId, imageUrl } = deleteTarget.extraData || {};
        if (productId && imageUrl) {
          await deleteProductImage(productId, imageUrl);
          await onRefreshData();
          showNotification('Product image deleted successfully');
        }
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      showNotification(parseErrorMessage(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const promptDeleteOrder = (orderId: string, orderNumber: string) => {
    setDeleteTarget({
      type: 'order',
      id: orderId,
      name: orderNumber,
    });
  };

  // EDIT STATE FOR MERCH
  const [editingMerch, setEditingMerch] = useState<Partial<MerchItem> | null>(null);
  const [merchSizeInput, setMerchSizeInput] = useState('');
  const [merchColorInput, setMerchColorInput] = useState('');
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

  // ADD / REMOVE COLOR HELPER
  const handleAddColor = (colorToAdd?: string) => {
    const c = (colorToAdd ?? merchColorInput).trim();
    if (!c || !editingMerch) return;
    const currentColors = editingMerch.colors ? [...editingMerch.colors] : [];
    if (!currentColors.some(existing => existing.toLowerCase() === c.toLowerCase())) {
      currentColors.push(c);
    }
    setEditingMerch({ ...editingMerch, colors: currentColors });
    setMerchColorInput('');
  };

  const handleRemoveColor = (colorToRemove: string) => {
    if (!editingMerch || !editingMerch.colors) return;
    setEditingMerch({
      ...editingMerch,
      colors: editingMerch.colors.filter(c => c !== colorToRemove),
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

      // Colors & Color-Images Mapping
      const color1 = editingMerch.colors?.[0] || 'Black';
      const color2 = editingMerch.colors?.[1] || (secondImage.trim() ? 'White' : undefined);
      
      const resolvedColors = editingMerch.colors && editingMerch.colors.length > 0 
        ? editingMerch.colors 
        : [color1, ...(color2 ? [color2] : [])];

      const colorImages: Record<string, string> = {
        ...(editingMerch.colorImages || {})
      };
      if (editingMerch.coverImage) {
        colorImages[resolvedColors[0] || 'Black'] = editingMerch.coverImage.trim();
      }
      if (secondImage.trim() && resolvedColors.length > 1) {
        colorImages[resolvedColors[1] || 'White'] = secondImage.trim();
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
        colors: resolvedColors,
        colorImages: colorImages,
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
  const handleDeleteMerch = (id: string, name?: string) => {
    const item = merch.find(m => m.id === id);
    setDeleteTarget({
      type: 'merch',
      id,
      name: name || item?.name || 'Garment Item',
    });
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
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

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
            TURVEX — Store Dashboard
          </h1>
          <p className="text-xs text-[#707070] font-mono mt-1">
            Logged in as: <span className="text-white font-medium">{user?.email || adminEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onRefreshData();
              loadOrders();
              showNotification('Database and orders refreshed');
            }}
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
            { id: 'orders' as AdminSection, label: 'Customer Orders', count: orders.length, icon: ClipboardList, pendingBadge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined },
            { id: 'merch' as AdminSection, label: 'Store Products', count: merch.length, icon: ShoppingBag },
            { id: 'images' as AdminSection, label: 'Image Management', count: undefined, icon: ImageIcon },
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
                <div className="flex items-center gap-1.5">
                  {tab.pendingBadge && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono rounded">
                      {tab.pendingBadge}
                    </span>
                  )}
                  {tab.count !== undefined && (
                    <span className="text-[10px] font-mono tabular-nums text-[#666666]">{tab.count}</span>
                  )}
                </div>
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
                          colors: ['Washed Black', 'Vintage Grey'],
                          inStock: true,
                          isFeatured: true,
                          isPublished: true,
                          whatsappNumber: '+201000000000',
                          orderUrl: '',
                        });
                        setMerchSizeInput('');
                        setMerchColorInput('');
                        setMerchImageInput('');
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

          {/* ================= SECTION: CUSTOMER ORDERS ================= */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5] flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-white" />
                    <span>Customer Orders &amp; Fulfillment</span>
                  </h2>
                  <p className="text-xs text-[#707070] font-mono mt-0.5">
                    Live checkout orders logged directly from customers into Firestore.
                  </p>
                </div>
                <button
                  onClick={loadOrders}
                  className="px-3.5 py-1.5 bg-[#161616] border border-[#333333] hover:border-white text-xs uppercase tracking-wider text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span>Reload Orders ({orders.length})</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0B0B] border border-[#242424] p-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search name, phone, order #..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#111111] border border-[#262626] text-xs text-white placeholder-[#555] outline-none font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        orderFilterStatus === st
                          ? 'bg-white text-black font-bold'
                          : 'text-[#888888] hover:text-white bg-[#141414] hover:bg-[#1E1E1E]'
                      }`}
                    >
                      {st} {st === 'pending' && pendingOrdersCount > 0 ? `(${pendingOrdersCount})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {orders.length === 0 ? (
                <div className="p-16 text-center bg-[#0B0B0B] border border-[#242424] space-y-3">
                  <ClipboardList className="w-8 h-8 text-[#555555] mx-auto" />
                  <p className="text-sm font-semibold text-white uppercase tracking-wider">
                    No orders placed yet
                  </p>
                  <p className="text-xs text-[#707070] max-w-sm mx-auto">
                    When customers complete checkout, their order code, shipping address, and chosen pieces will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter(order => {
                      if (orderFilterStatus !== 'all' && order.status !== orderFilterStatus) return false;
                      if (!orderSearchQuery.trim()) return true;
                      const q = orderSearchQuery.toLowerCase();
                      return (
                        order.orderNumber.toLowerCase().includes(q) ||
                        order.customerName.toLowerCase().includes(q) ||
                        order.customerPhone.toLowerCase().includes(q) ||
                        order.governorate.toLowerCase().includes(q) ||
                        order.city.toLowerCase().includes(q)
                      );
                    })
                    .map(order => {
                      const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
                      const formattedWaPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
                      const waLink = `https://wa.me/${formattedWaPhone}?text=${encodeURIComponent(
                        `Hello ${order.customerName}! Contacting you from TURVEX Studio regarding your order #${order.orderNumber}.`
                      )}`;

                      return (
                        <div
                          key={order.id}
                          className="bg-[#0B0B0B] border border-[#242424] hover:border-[#444444] p-5 sm:p-6 transition-all space-y-5"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-base font-bold text-white tracking-widest">
                                {order.orderNumber}
                              </span>
                              <span className="text-[11px] text-[#707070] font-mono">
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wider text-[#707070] font-mono">Status:</span>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as CustomerOrder['status'])}
                                className={`px-2.5 py-1 text-xs font-mono uppercase font-bold border rounded outline-none cursor-pointer ${
                                  order.status === 'pending'
                                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-300'
                                    : order.status === 'shipped'
                                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                                    : order.status === 'delivered'
                                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                                }`}
                              >
                                <option value="pending" className="bg-[#111] text-amber-300">Pending Review</option>
                                <option value="confirmed" className="bg-[#111] text-blue-300">Confirmed</option>
                                <option value="shipped" className="bg-[#111] text-purple-300">Shipped</option>
                                <option value="delivered" className="bg-[#111] text-emerald-300">Delivered</option>
                                <option value="cancelled" className="bg-[#111] text-red-300">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer Details & Shipping Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-[#CCCCCC] bg-[#0E0E0E] p-4 border border-[#1C1C1C]">
                            <div className="space-y-1.5">
                              <p className="flex items-center gap-2 text-white font-semibold">
                                <User className="w-3.5 h-3.5 text-[#888888]" />
                                <span>{order.customerName}</span>
                              </p>
                              <p className="flex items-center gap-2 text-[#A1A1A1]">
                                <Phone className="w-3.5 h-3.5 text-[#888888]" />
                                <span>{order.customerPhone}</span>
                              </p>
                              {order.customerEmail && order.customerEmail !== 'unspecified@turvex.store' && (
                                <p className="flex items-center gap-2 text-[#707070]">
                                  <Mail className="w-3.5 h-3.5 text-[#888888]" />
                                  <span>{order.customerEmail}</span>
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <p className="flex items-start gap-2 text-[#CCCCCC]">
                                <MapPin className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                                <span>{order.address}, {order.city}, {order.governorate}</span>
                              </p>
                              {order.notes && (
                                <p className="text-[11px] text-[#A1A1A1] italic">
                                  Notes: "{order.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Ordered Pieces */}
                          <div className="space-y-2">
                            <span className="text-[11px] uppercase tracking-wider text-[#707070] font-mono block">
                              Ordered Garments ({order.items.length})
                            </span>
                            <div className="divide-y divide-[#1A1A1A] border-y border-[#1A1A1A]">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-12 object-cover border border-[#242424] shrink-0 rounded"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                                      <div className="flex items-center gap-2 text-[11px] text-[#888888] font-mono mt-0.5">
                                        <span>Color: <strong className="text-white">{item.color}</strong></span>
                                        <span>·</span>
                                        <span>Size: <strong className="text-white">{item.size}</strong></span>
                                        <span>·</span>
                                        <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-white shrink-0">
                                    {item.price * item.quantity} EGP
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals & Quick Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                            <div className="flex items-center gap-4 text-xs font-mono">
                              <div>
                                <span className="text-[#707070] block text-[10px]">Method</span>
                                <span className="text-white">{order.paymentMethod}</span>
                              </div>
                              <div>
                                <span className="text-[#707070] block text-[10px]">Total with Delivery</span>
                                <span className="text-base font-bold text-white">{order.total} EGP</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>WhatsApp Customer</span>
                              </a>

                              <a
                                href={`tel:${order.customerPhone}`}
                                className="px-3 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#333] text-[#CCC] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                              >
                                <span>Call</span>
                              </a>

                              <button
                                onClick={() => promptDeleteOrder(order.id, order.orderNumber)}
                                className="p-1.5 text-[#707070] hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete order record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
                      colors: ['Washed Black', 'Vintage Grey'],
                      inStock: true,
                      isFeatured: false,
                      isPublished: true,
                      whatsappNumber: '+201000000000',
                      orderUrl: '',
                    });
                    setMerchSizeInput('');
                    setMerchColorInput('');
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

                    {/* 3. PRODUCT PHOTOS BY COLOR (Color 1: Black & Color 2: White) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1C1C1C]">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-white font-mono font-bold flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-400" />
                            <span>Product Photos by Colorway (Primary &amp; Secondary)</span>
                          </label>
                          <span className="text-[11px] text-[#A1A1A1] font-mono block mt-0.5">
                            Upload a photo for your primary color (e.g. Black) and secondary color (e.g. White). Switching colorways dynamically updates the storefront preview!
                          </span>
                        </div>

                        {/* Quick Presets for Black & White */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = editingMerch.colors ? [...editingMerch.colors] : [];
                              const newCols = ['Black', 'White', ...cur.filter(c => c.toLowerCase() !== 'black' && c.toLowerCase() !== 'white')];
                              setEditingMerch({ ...editingMerch, colors: newCols });
                            }}
                            className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-emerald-500/50 text-[10px] font-mono text-emerald-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <span>+ Set Black &amp; White Palette</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CARD 1: COLOR 1 PHOTO (PRIMARY / BLACK) */}
                        <div className="bg-[#111111] border border-[#262626] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="text-xs font-mono uppercase text-white font-bold">
                                Photo 1 (Primary Color):
                              </span>
                              <input
                                type="text"
                                value={editingMerch.colors?.[0] || 'Black'}
                                onChange={e => {
                                  const rest = (editingMerch.colors || []).slice(1);
                                  setEditingMerch({
                                    ...editingMerch,
                                    colors: [e.target.value, ...rest],
                                  });
                                }}
                                placeholder="Color name (e.g. Black)"
                                className="bg-[#0B0B0B] border border-[#333] px-2 py-0.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400 w-28 uppercase"
                              />
                            </div>
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
                                alt="Color 1 Photo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-4 text-[#555555] space-y-2">
                                <Upload className="w-6 h-6 mx-auto text-[#444444]" />
                                <p className="text-[11px] font-mono text-[#888888]">Photo 1 (Required)</p>
                                <p className="text-[10px] font-mono text-[#555555]">Primary colorway photo (e.g. Washed Black)</p>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/90 border border-emerald-500/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400 uppercase font-bold">
                              Color 1: {editingMerch.colors?.[0] || 'Black'}
                            </div>
                          </div>

                          {/* Image 1 Inputs */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              required
                              value={editingMerch.coverImage || ''}
                              onChange={e => setEditingMerch({ ...editingMerch, coverImage: e.target.value })}
                              placeholder="Photo 1 URL or use upload button..."
                              className="w-full bg-[#0B0B0B] border border-[#262626] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                            />
                            <label className="w-full py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-[#2D2D2D] hover:border-emerald-500/60 cursor-pointer text-xs text-white font-mono flex items-center justify-center gap-2 transition-colors">
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Upload Photo 1 ({editingMerch.colors?.[0] || 'Black'})</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleImageFileUpload(e, base64 => setEditingMerch({ ...editingMerch, coverImage: base64 }))}
                              />
                            </label>
                          </div>
                        </div>

                        {/* CARD 2: COLOR 2 PHOTO (WHITE / SECONDARY) */}
                        <div className="bg-[#111111] border border-[#262626] p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                              <span className="text-xs font-mono uppercase text-white font-bold">
                                Photo 2 (Secondary Color):
                              </span>
                              <input
                                type="text"
                                value={editingMerch.colors?.[1] || 'White'}
                                onChange={e => {
                                  const c1 = editingMerch.colors?.[0] || 'Black';
                                  const rest = (editingMerch.colors || []).slice(2);
                                  setEditingMerch({
                                    ...editingMerch,
                                    colors: [c1, e.target.value, ...rest],
                                  });
                                }}
                                placeholder="Color name (e.g. White)"
                                className="bg-[#0B0B0B] border border-[#333] px-2 py-0.5 text-xs text-blue-300 font-mono font-bold focus:outline-none focus:border-blue-400 w-28 uppercase"
                              />
                            </div>
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
                                alt="Color 2 Photo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-4 text-[#555555] space-y-2">
                                <Upload className="w-6 h-6 mx-auto text-[#444444]" />
                                <p className="text-[11px] font-mono text-[#888888]">Photo 2 (Second Color)</p>
                                <p className="text-[10px] font-mono text-[#555555]">Secondary colorway photo (e.g. Vintage White)</p>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/90 border border-blue-500/60 px-2 py-0.5 text-[10px] font-mono text-blue-300 uppercase font-bold">
                              Color 2: {editingMerch.colors?.[1] || 'White'}
                            </div>
                          </div>

                          {/* Image 2 Inputs */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={secondImage || ''}
                              onChange={e => handleSetSecondImage(e.target.value)}
                              placeholder="Photo 2 URL or use upload button..."
                              className="w-full bg-[#0B0B0B] border border-[#262626] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                            />
                            <label className="w-full py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-[#2D2D2D] hover:border-blue-500/60 cursor-pointer text-xs text-white font-mono flex items-center justify-center gap-2 transition-colors">
                              <Upload className="w-3.5 h-3.5 text-blue-400" />
                              <span>Upload Photo 2 ({editingMerch.colors?.[1] || 'White'})</span>
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

                    {/* 6. Available Colors (Customer Selectable at Checkout) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] uppercase tracking-wider text-[#A1A1A1] font-mono">
                          Available Garment Colors (Customer selectable at checkout)
                        </label>
                        <span className="text-[10px] text-[#707070] font-mono">
                          {editingMerch.colors?.length || 0} Colors Selected
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={merchColorInput}
                          onChange={e => setMerchColorInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddColor();
                            }
                          }}
                          placeholder="Type color (e.g. Washed Black, Vintage Grey, Sand, Bone White) and click Add"
                          className="flex-1 bg-[#111111] border border-[#242424] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddColor()}
                          className="px-4 py-2 bg-[#1E1E1E] border border-[#333333] hover:border-[#707070] text-xs text-white uppercase font-mono cursor-pointer"
                        >
                          Add Color
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono text-[#666666] mr-1">Presets:</span>
                        {[
                          'Washed Black', 
                          'Vintage Grey', 
                          'Bone White', 
                          'Charcoal', 
                          'Forest Green', 
                          'Navy Blue', 
                          'Earth Brown', 
                          'Burgundy'
                        ].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleAddColor(c)}
                            className="px-2 py-0.5 bg-[#141414] hover:bg-[#202020] border border-[#242424] hover:border-[#555] text-[10px] font-mono text-[#A1A1A1] hover:text-white cursor-pointer transition-colors"
                          >
                            + {c}
                          </button>
                        ))}
                      </div>

                      {/* Active Colors Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {editingMerch.colors?.map(col => (
                          <span
                            key={col}
                            className="bg-[#141414] border border-[#2D2D2D] px-2.5 py-1 text-xs font-mono text-white flex items-center gap-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{col}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(col)}
                              className="text-[#707070] hover:text-red-400 cursor-pointer ml-0.5"
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
                            {item.colors && item.colors.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-400">Colors: {item.colors.join(', ')}</span>
                              </>
                            )}
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
                          onClick={() => handleDeleteMerch(item.id, item.name)}
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

          {/* ================= SECTION: IMAGE MANAGEMENT ================= */}
          {activeSection === 'images' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-4">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-[#F5F5F5] flex items-center gap-2 font-mono">
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                    <span>Image &amp; Media Studio</span>
                  </h2>
                  <p className="text-xs text-[#888888] font-mono mt-1">
                    Upload, replace, and reorder all product photos and campaign banners without editing code.
                  </p>
                </div>

                {/* Subtab Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-[#111111] border border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setImageSubtab('website')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      imageSubtab === 'website'
                        ? 'bg-white text-black font-bold'
                        : 'text-[#888888] hover:text-white'
                    }`}
                  >
                    Website Banners
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSubtab('products')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      imageSubtab === 'products'
                        ? 'bg-white text-black font-bold'
                        : 'text-[#888888] hover:text-white'
                    }`}
                  >
                    Product Photos ({merch.length})
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: WEBSITE & CAMPAIGN BANNERS */}
              {imageSubtab === 'website' && (
                <div className="space-y-6">
                  <div className="p-4 bg-[#111111] border border-[#222222] text-xs font-mono text-[#CCCCCC] flex items-center justify-between">
                    <span>Manage all flagship lookbook photos, campaign capsules, and brand story media.</span>
                    <button
                      type="button"
                      onClick={async () => {
                        setSavingImages(true);
                        try {
                          await updateWebsiteImages(editableSettings.websiteImages || {});
                          await onRefreshData();
                          showNotification('Website images saved successfully');
                        } catch (err) {
                          showNotification(parseErrorMessage(err), 'error');
                        } finally {
                          setSavingImages(false);
                        }
                      }}
                      disabled={savingImages}
                      className="px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 hover:bg-white/90 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingImages ? 'Saving...' : 'Save All Changes'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {([
                      {
                        key: 'homeHeroImage' as const,
                        label: 'Homepage Hero Lookbook Backdrop',
                        aspect: 'aspect-[16/9]',
                        defaultUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2000&q=85',
                        description: 'Main full-screen background on the homepage hero section.',
                      },
                      {
                        key: 'capsuleHeavyweightImage' as const,
                        label: 'Capsule 01: 480GSM Boxy Hoodies Banner',
                        aspect: 'aspect-[16/10]',
                        defaultUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
                        description: 'Featured editorial banner for heavyweight hoodie drops.',
                      },
                      {
                        key: 'capsuleAcidWashImage' as const,
                        label: 'Capsule 02: 280GSM Acid Wash Tees Banner',
                        aspect: 'aspect-[16/10]',
                        defaultUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
                        description: 'Featured banner for stone acid wash tee collection.',
                      },
                      {
                        key: 'capsuleTacticalImage' as const,
                        label: 'Capsule 03: Tactical Movement & Cargo Banner',
                        aspect: 'aspect-[16/10]',
                        defaultUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85',
                        description: 'Featured banner for wide-leg pants and utility gear.',
                      },
                      {
                        key: 'capsuleHeadwearImage' as const,
                        label: 'Capsule 04: Dark Luxury Headwear Banner',
                        aspect: 'aspect-[16/10]',
                        defaultUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1400&q=85',
                        description: 'Featured banner for trucker caps and ribbed beanies.',
                      },
                      {
                        key: 'brandStoryImage' as const,
                        label: 'Atelier Brand Story Workshop Image',
                        aspect: 'aspect-[4/3]',
                        defaultUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
                        description: 'Craftsmanship showcase image on homepage brand story.',
                      },
                      {
                        key: 'aboutHeroImage' as const,
                        label: 'About Page Editorial Showcase Photo',
                        aspect: 'aspect-[3/4]',
                        defaultUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85',
                        description: 'Main editorial portrait on the About brand page.',
                      },
                      {
                        key: 'promoBannerImage' as const,
                        label: 'Promotional & Announcement Banner',
                        aspect: 'aspect-[16/9]',
                        defaultUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=85',
                        description: 'Secondary campaign lookbook highlight.',
                      },
                    ] as const).map(slot => {
                      const rawVal = editableSettings.websiteImages?.[slot.key];
                      const currentVal: string = typeof rawVal === 'string' ? rawVal : '';
                      const displayUrl: string = currentVal || slot.defaultUrl;

                      return (
                        <div key={slot.key} className="bg-[#0B0B0B] border border-[#242424] p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase text-white">
                              {slot.label}
                            </span>
                            {currentVal && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const updated = { ...(editableSettings.websiteImages || {}) };
                                  delete updated[slot.key];
                                  setEditableSettings({ ...editableSettings, websiteImages: updated });
                                  try {
                                    await updateWebsiteImages(updated);
                                    await onRefreshData();
                                    showNotification(`Reset ${slot.label} to default`);
                                  } catch (err) {
                                    showNotification(parseErrorMessage(err), 'error');
                                  }
                                }}
                                className="text-[10px] font-mono text-red-400 hover:text-red-300 uppercase cursor-pointer"
                              >
                                Reset to Default
                              </button>
                            )}
                          </div>

                          {/* Image Preview */}
                          <div className={`${slot.aspect} bg-[#0A0A0A] border border-[#1F1F1F] relative overflow-hidden flex items-center justify-center group`}>
                            <img
                              src={displayUrl}
                              alt={slot.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 bg-black/85 border border-white/20 px-2 py-0.5 text-[10px] font-mono text-white uppercase">
                              {currentVal ? 'Custom Active' : 'Default Asset'}
                            </div>
                          </div>

                          <p className="text-[11px] text-[#707070] font-mono">
                            {slot.description}
                          </p>

                          {/* Inputs: URL & File Upload */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={currentVal}
                              onChange={e => {
                                const newWebImages = {
                                  ...(editableSettings.websiteImages || {}),
                                  [slot.key]: e.target.value,
                                };
                                setEditableSettings({ ...editableSettings, websiteImages: newWebImages });
                              }}
                              placeholder="Paste image URL here..."
                              className="w-full bg-[#111111] border border-[#262626] px-3 py-2 text-xs text-[#F5F5F5] font-mono focus:border-white outline-none"
                            />

                            <div className="flex gap-2">
                              <label className="flex-1 py-2 bg-[#161616] hover:bg-[#202020] border border-[#2D2D2D] hover:border-white text-xs text-white font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleImageFileUpload(e, base64 => {
                                    const newWebImages = {
                                      ...(editableSettings.websiteImages || {}),
                                      [slot.key]: base64,
                                    };
                                    setEditableSettings({ ...editableSettings, websiteImages: newWebImages });
                                  })}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await updateWebsiteImages(editableSettings.websiteImages || {});
                                    await onRefreshData();
                                    showNotification(`${slot.label} updated successfully`);
                                  } catch (err) {
                                    showNotification(parseErrorMessage(err), 'error');
                                  }
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: PRODUCT PHOTOS MANAGER */}
              {imageSubtab === 'products' && (
                <div className="space-y-6">
                  {/* Product Picker */}
                  <div className="bg-[#0B0B0B] border border-[#242424] p-5 space-y-3">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>Select Garment to Manage Photos</span>
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(e.target.value)}
                      className="w-full bg-[#111111] border border-[#333333] px-3.5 py-2.5 text-xs text-white font-mono uppercase font-semibold outline-none cursor-pointer focus:border-white"
                    >
                      {merch.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#111111] text-white">
                          {m.name} &bull; {m.category.toUpperCase()} ({m.images?.length || 1} photos)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Product Gallery Cards */}
                  {(() => {
                    const currentProduct = merch.find(m => m.id === selectedProductId) || merch[0];
                    if (!currentProduct) {
                      return (
                        <div className="p-8 text-center text-[#707070] font-mono text-xs">
                          No garments found in database.
                        </div>
                      );
                    }

                    const productImages: string[] = Array.isArray(currentProduct.images) && currentProduct.images.length > 0
                      ? [...currentProduct.images]
                      : [currentProduct.coverImage];

                    return (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242424]">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#707070] block">
                              Active Garment
                            </span>
                            <h3 className="text-base font-bold uppercase text-white font-mono mt-0.5">
                              {currentProduct.name}
                            </h3>
                            <span className="text-xs text-[#A1A1A1] font-mono">
                              {productImages.length} Photos in Gallery &bull; Price: {currentProduct.price} {currentProduct.currency || 'EGP'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#888888] font-mono">
                              Main Cover:
                            </span>
                            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                              Photo 1
                            </span>
                          </div>
                        </div>

                        {/* Current Photos Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {productImages.map((imgUrl, idx) => {
                            const isMainCover = idx === 0 || imgUrl === currentProduct.coverImage;

                            return (
                              <div
                                key={idx}
                                className={`bg-[#0E0E0E] border p-4 space-y-3 relative ${
                                  isMainCover ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/20' : 'border-[#242424]'
                                }`}
                              >
                                {/* Header / Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {isMainCover ? (
                                      <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-emerald-300" />
                                        <span>Main Cover</span>
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-mono text-[#888888]">
                                        Photo #{idx + 1}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Move Left */}
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={async () => {
                                        const reordered = [...productImages];
                                        const temp = reordered[idx - 1];
                                        reordered[idx - 1] = reordered[idx];
                                        reordered[idx] = temp;
                                        try {
                                          await updateProductImages(currentProduct.id, reordered, reordered[0]);
                                          await onRefreshData();
                                          showNotification('Photos reordered');
                                        } catch (err) {
                                          showNotification(parseErrorMessage(err), 'error');
                                        }
                                      }}
                                      className="p-1 text-[#707070] hover:text-white disabled:opacity-30 cursor-pointer"
                                      title="Move Left"
                                    >
                                      <MoveLeft className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Move Right */}
                                    <button
                                      type="button"
                                      disabled={idx === productImages.length - 1}
                                      onClick={async () => {
                                        const reordered = [...productImages];
                                        const temp = reordered[idx + 1];
                                        reordered[idx + 1] = reordered[idx];
                                        reordered[idx] = temp;
                                        try {
                                          await updateProductImages(currentProduct.id, reordered, reordered[0]);
                                          await onRefreshData();
                                          showNotification('Photos reordered');
                                        } catch (err) {
                                          showNotification(parseErrorMessage(err), 'error');
                                        }
                                      }}
                                      className="p-1 text-[#707070] hover:text-white disabled:opacity-30 cursor-pointer"
                                      title="Move Right"
                                    >
                                      <MoveRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Thumbnail */}
                                <div className="aspect-[3/4] bg-[#080808] border border-[#1A1A1A] relative overflow-hidden flex items-center justify-center">
                                  <img
                                    src={imgUrl}
                                    alt={`Product Photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Action Buttons for Photo */}
                                <div className="space-y-2 pt-1">
                                  {!isMainCover && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const reordered = [imgUrl, ...productImages.filter((_, i) => i !== idx)];
                                        try {
                                          await updateProductImages(currentProduct.id, reordered, imgUrl);
                                          await onRefreshData();
                                          showNotification('Set as main cover image');
                                        } catch (err) {
                                          showNotification(parseErrorMessage(err), 'error');
                                        }
                                      }}
                                      className="w-full py-1.5 px-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[11px] font-mono text-white uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Star className="w-3 h-3 text-emerald-400" />
                                      <span>Set as Main Cover</span>
                                    </button>
                                  )}

                                  <div className="flex gap-2">
                                    <label className="flex-1 py-1.5 px-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-[11px] font-mono text-[#CCCCCC] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer">
                                      <Upload className="w-3 h-3 text-blue-400" />
                                      <span>Replace</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => handleImageFileUpload(e, async base64 => {
                                          const updated = [...productImages];
                                          updated[idx] = base64;
                                          try {
                                            await updateProductImages(currentProduct.id, updated, isMainCover ? base64 : undefined);
                                            await onRefreshData();
                                            showNotification('Photo replaced successfully');
                                          } catch (err) {
                                            showNotification(parseErrorMessage(err), 'error');
                                          }
                                        })}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteTarget({
                                          type: 'product_image',
                                          id: currentProduct.id,
                                          name: `Photo #${idx + 1} (${currentProduct.name})`,
                                          extraData: { productId: currentProduct.id, imageUrl: imgUrl },
                                        });
                                      }}
                                      className="p-1.5 text-[#707070] hover:text-red-400 border border-[#2B2B2B] hover:border-red-900/40 transition-colors cursor-pointer"
                                      title="Delete Photo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* CARD: UPLOAD & ADD NEW PHOTO */}
                          <div className="bg-[#0B0B0B] border border-dashed border-[#333333] hover:border-white p-5 flex flex-col justify-between space-y-4">
                            <div className="text-center py-4 space-y-2">
                              <Plus className="w-8 h-8 mx-auto text-[#666666]" />
                              <h4 className="text-xs font-mono font-bold uppercase text-white">
                                Add Another Product Photo
                              </h4>
                              <p className="text-[11px] font-mono text-[#707070]">
                                Upload additional angles, close-ups of fabric, or alternate colorways.
                              </p>
                            </div>

                            <div className="space-y-2.5">
                              <label className="w-full py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-white/90 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Image File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleImageFileUpload(e, async base64 => {
                                    const updated = [...productImages, base64];
                                    try {
                                      await updateProductImages(currentProduct.id, updated);
                                      await onRefreshData();
                                      showNotification('New photo added to gallery');
                                    } catch (err) {
                                      showNotification(parseErrorMessage(err), 'error');
                                    }
                                  })}
                                />
                              </label>

                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={newProductImageUrl}
                                  onChange={e => setNewProductImageUrl(e.target.value)}
                                  placeholder="Or paste image URL..."
                                  className="flex-1 bg-[#141414] border border-[#262626] px-2.5 py-1.5 text-xs text-white font-mono focus:border-white outline-none"
                                />
                                <button
                                  type="button"
                                  disabled={!newProductImageUrl.trim()}
                                  onClick={async () => {
                                    if (!newProductImageUrl.trim()) return;
                                    const updated = [...productImages, newProductImageUrl.trim()];
                                    try {
                                      await updateProductImages(currentProduct.id, updated);
                                      await onRefreshData();
                                      setNewProductImageUrl('');
                                      showNotification('New photo URL added to gallery');
                                    } catch (err) {
                                      showNotification(parseErrorMessage(err), 'error');
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-[#222222] hover:bg-[#333333] text-white text-xs font-mono uppercase cursor-pointer disabled:opacity-40"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
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
                      placeholder="TURVEX. STREETWEAR ARCHIVE."
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

      {/* IN-APP CONFIRMATION MODAL FOR DELETIONS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0B0B0B] border border-[#441C1C] max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => !isDeleting && setDeleteTarget(null)}
              className="absolute top-4 right-4 text-[#707070] hover:text-white p-1 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#1F0A0A] border border-[#4D1A1A] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold tracking-widest text-[#F5F5F5] uppercase font-mono">
                  Confirm Deletion
                </h3>
                <p className="text-[11px] text-[#888888]">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#CCCCCC] leading-relaxed">
              {deleteTarget.type === 'merch' &&
                'Are you sure you want to delete this garment? It will be permanently removed from the storefront, inventory database, and any customer carts.'}
              {deleteTarget.type === 'order' &&
                'Are you sure you want to delete this customer order? This record will be permanently purged from database order history.'}
              {deleteTarget.type === 'product_image' &&
                'Are you sure you want to remove this photo from the product gallery? The storefront will reflect this change immediately.'}
            </p>

            <div className="p-3 bg-[#111111] border border-[#262626] text-xs font-mono text-white break-all flex items-center gap-2">
              <span className="text-red-400">&bull;</span>
              <span className="font-semibold">{deleteTarget.name}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-xs text-[#A1A1A1] hover:text-white font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeConfirmedDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
