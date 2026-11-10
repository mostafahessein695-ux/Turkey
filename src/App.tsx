import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { 
  MerchItem, 
  SiteSettings, 
  NavTab 
} from './types';
import { 
  fetchPublishedMerch,
  fetchAllMerch,
  fetchSiteSettings
} from './services/db';
import { LiquidGlassNavbar } from './components/LiquidGlassNavbar';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchModal } from './components/SearchModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { AboutPage } from './pages/AboutPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainApp: React.FC = () => {
  const { isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [loading, setLoading] = useState(true);

  // Database state
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    heroHeadline: 'TURVEX. HEAVYWEIGHT STREETWEAR.',
    heroSubhead: 'Bespoke cuts, heavyweight knits, and limited capsule drops designed for everyday movement.',
    aboutBio: 'TURVEX is an independent streetwear atelier and garment archive focused on custom 480GSM heavyweight cotton silhouettes, stone acid washes, and durable minimalism.',
    socialLinks: [
      { platform: 'Instagram', url: 'https://instagram.com/turvex.studio', handle: '@turvex.studio' },
      { platform: 'WhatsApp', url: 'https://wa.me/201000000000', handle: 'Studio Direct' },
      { platform: 'TikTok', url: 'https://tiktok.com/@turvex', handle: '@turvex' },
    ],
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<MerchItem | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  // Load database data
  const loadData = useCallback(async () => {
    try {
      const [merchData, settingsData] = await Promise.all([
        isAdmin ? fetchAllMerch() : fetchPublishedMerch(),
        fetchSiteSettings(),
      ]);
      setMerch(merchData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load TURVEX catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToShopWithCategory = (category: string) => {
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-white selection:text-black flex flex-col justify-between font-sans relative">
      {/* 1. Floating Apple iOS 26 Liquid Glass Navbar */}
      <LiquidGlassNavbar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        onOpenAdminAuth={() => setAdminAuthOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full min-w-0">
        {loading ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <p className="text-xs uppercase tracking-[0.25em] text-[#707070] font-mono">
              Loading TURVEX Studio...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                settings={settings}
                merch={merch}
                onSelectTab={handleTabChange}
                onOpenMerchDetail={item => setSelectedProduct(item)}
                onOpenAdminAuth={() => setAdminAuthOpen(true)}
                onNavigateToShopWithCategory={handleNavigateToShopWithCategory}
              />
            )}

            {(currentTab === 'shop' || currentTab === 'merch') && (
              <ShopPage
                products={merch}
                onOpenProductDetail={item => setSelectedProduct(item)}
              />
            )}

            {currentTab === 'collections' && (
              <CollectionsPage
                products={merch}
                settings={settings}
                onNavigateToShopWithCategory={handleNavigateToShopWithCategory}
                onOpenProductDetail={item => setSelectedProduct(item)}
              />
            )}

            {currentTab === 'about' && (
              <AboutPage
                settings={settings}
                onExploreShop={() => handleTabChange('shop')}
              />
            )}

            {currentTab === 'checkout' && (
              <CheckoutPage
                onBackToShop={() => handleTabChange('shop')}
                onNavigateTab={handleTabChange}
              />
            )}

            {currentTab === 'admin' && (
              isAdmin ? (
                <div className="pt-24 pb-12">
                  <AdminDashboard
                    merch={merch}
                    settings={settings}
                    onRefreshData={loadData}
                  />
                </div>
              ) : (
                <div className="max-w-md mx-auto px-6 py-40 text-center space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                    <span className="font-mono text-xs font-bold">LOCK</span>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold uppercase tracking-wide text-[#F5F5F5]">
                      Admin Access Restricted
                    </h2>
                    <p className="text-xs text-[#888888] leading-relaxed">
                      TURVEX studio administration portal. Please authenticate with administrator credentials to continue.
                    </p>
                  </div>
                  <button
                    onClick={() => setAdminAuthOpen(true)}
                    className="px-6 py-3 bg-white text-black text-xs uppercase font-bold tracking-wider rounded-xl cursor-pointer hover:bg-white/90 shadow-xl transition-all"
                  >
                    Admin Sign In
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* 3. Luxury Dark Minimal Footer */}
      <Footer
        settings={settings}
        onSelectTab={handleTabChange}
        onOpenAdminAuth={() => setAdminAuthOpen(true)}
      />

      {/* 4. Modals & Overlays */}
      <CartDrawer
        onProceedToCheckout={() => handleTabChange('checkout')}
        onExploreProducts={() => handleTabChange('shop')}
      />

      <ProductDetailModal
        product={selectedProduct}
        allProducts={merch}
        onClose={() => setSelectedProduct(null)}
        onSelectOtherProduct={p => setSelectedProduct(p)}
      />

      <SearchModal
        isOpen={searchModalOpen}
        products={merch}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={p => setSelectedProduct(p)}
      />

      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onSuccess={() => {
          setCurrentTab('admin');
          loadData();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
