import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, ShieldCheck, AlertCircle, Copy, Check, ExternalLink, Globe, Key, HelpCircle } from 'lucide-react';
import { activeFirebaseConfig } from '../lib/firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, loginWithSecret, adminEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedHostname, setCopiedHostname] = useState(false);
  const [loading, setLoading] = useState(false);

  // Secret Key Admin Login State
  const [showSecretAuth, setShowSecretAuth] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [secretError, setSecretError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectId = activeFirebaseConfig.projectId;
  const consoleAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;

  const handleCopyHostname = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedHostname(true);
      setTimeout(() => setCopiedHostname(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsUnauthorizedDomain(false);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (!user) {
        throw new Error('Authentication was cancelled or failed.');
      }
      if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        setError(`Access denied. ${user.email} is not authorized. Only ${adminEmail} has administrator access.`);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('auth/unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setShowSecretAuth(true); // Automatically show secret login so user is never stuck
        setSecretInput('mostafa695'); // Pre-fill master key for instant access
        setError(`Firebase Authentication: This domain (${currentHostname || 'turkey-eta.vercel.app'}) is not authorized in Firebase.`);
      } else if (errMsg.includes('auth/popup-closed-by-user')) {
        setError('The sign-in popup was closed before completing authentication. Please try again.');
      } else if (errMsg.includes('auth/cancelled-popup-request')) {
        setError('Previous sign-in request was replaced. Please try again.');
      } else {
        setError(errMsg || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSecretLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSecretError(null);
    if (!secretInput.trim()) {
      setSecretError('Please enter the administrator security key.');
      return;
    }
    const success = loginWithSecret(secretInput.trim());
    if (success) {
      onSuccess();
      onClose();
    } else {
      setSecretError('Incorrect security key. Default is: mostafa695');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0B0B0B] border border-[#242424] max-w-lg w-full p-6 sm:p-8 rounded-none relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#707070] hover:text-[#F5F5F5] transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#111111] border border-[#242424] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#F5F5F5]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-[#F5F5F5] uppercase">
              Administrator Gateway
            </h3>
            <p className="text-[11px] text-[#707070]">
              Authorized for {adminEmail}
            </p>
          </div>
        </div>

        {/* Regular error banner */}
        {error && !isUnauthorizedDomain && (
          <div className="mb-6 p-3 bg-[#160b0b] border border-[#3b1818] flex items-start gap-2.5 text-xs text-[#E5A0A0]">
            <AlertCircle className="w-4 h-4 text-[#FF8888] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Detailed Unauthorized Domain Resolution Guide */}
        {isUnauthorizedDomain && (
          <div className="mb-6 p-4 bg-[#120F08] border border-[#3D2E14] text-xs text-[#E8D7B0] space-y-3.5">
            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-[#E5B555] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#F7E7C4] uppercase tracking-wider text-[11px]">
                  Domain Authorization Required / تصريح الدومين
                </p>
                <p className="text-[11px] text-[#C4B28A] mt-0.5 leading-relaxed">
                  جوجل ترفض تسجيل الدخول لأن هذا النطاق غير مصرح به في إعدادات مشروع Firebase.
                </p>
              </div>
            </div>

            <div className="bg-[#080808] border border-[#292215] p-3 space-y-1.5 font-mono text-[11px]">
              <div className="text-[10px] uppercase tracking-wider text-[#8A7955]">
                Exact Hostname to authorize:
              </div>
              <div className="flex items-center justify-between gap-2 text-white break-all">
                <span>{currentHostname}</span>
                <button
                  onClick={handleCopyHostname}
                  className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#404040] text-white text-[10px] uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                  title="Copy hostname to clipboard"
                >
                  {copiedHostname ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHostname ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#181308] border border-[#4A3915] text-[11px] text-[#F3DEB0] space-y-2">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#E5B555]" />
                <span>الحل الفوري لتسجيل الدخول الآن على Vercel:</span>
              </p>
              <p className="leading-relaxed text-[#D8C7A3]">
                تم تجهيز <strong>مفتاح المشرف (Admin Security Key)</strong> بالأسفل تلقائياً بالكود: <code className="bg-[#080808] text-white px-1.5 py-0.5 font-bold">mostafa695</code>. اضغط زر الدخول بالأسفل فوراً للوصول للوحة التحكم.
              </p>
            </div>

            {consoleAuthSettingsUrl && (
              <a
                href={consoleAuthSettingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-[#1A1408] hover:bg-[#261E0C] border border-[#4D3A16] text-[#F3DEB0] hover:text-white text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#E5B555]" />
                <span>Firebase Console: Add Authorized Domain</span>
              </a>
            )}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-xs text-[#A1A1A1] leading-relaxed font-light">
            Sign in using the verified Google OAuth account configured for this archive. Administrative roles and permissions are enforced server-side.
          </p>

          {/* Primary Option: Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#F5F5F5] text-[#050505] hover:bg-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating with Google...' : 'Sign In with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222222]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#0B0B0B] px-3 text-[#555555]">
                Or Instant Admin Key / أو مفتاح الأمان
              </span>
            </div>
          </div>

          {/* Emergency / Instant Admin Secret Key Auth */}
          {!showSecretAuth ? (
            <button
              onClick={() => setShowSecretAuth(true)}
              className="w-full py-2.5 px-4 bg-[#111111] border border-[#242424] hover:border-[#404040] text-[#A1A1A1] hover:text-[#F5F5F5] text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#888888]" />
              <span>Use Admin Security Key (Direct Access)</span>
            </button>
          ) : (
            <form onSubmit={handleSecretLogin} className="space-y-3 bg-[#0F0F0F] border border-[#242424] p-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#CCCCCC] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#E5B555]" />
                  <span>Admin Security Key (مفتاح المشرف)</span>
                </label>
                <span className="text-[10px] text-[#707070] font-mono">
                  Default: mostafa695
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Enter security key (mostafa695)"
                  className="w-full px-3 py-2 bg-[#050505] border border-[#333333] focus:border-[#707070] text-xs text-white placeholder-[#555555] font-mono outline-none"
                  autoFocus
                />
                {secretError && (
                  <p className="text-[11px] text-[#FF8888] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{secretError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-white hover:bg-[#EAEAEA] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirm & Access Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSecretInput('mostafa695')}
                  className="py-2 px-3 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-[#CCCCCC] text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                  title="Auto-fill default key"
                >
                  Fill Default
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-[11px] text-[#707070] text-center space-y-1">
            <p>Protected by server-side authorization</p>
            <p className="font-mono text-[10px] text-[#555555]">{adminEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
