import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, ShieldCheck, AlertCircle, Key, Eye, EyeOff, ArrowRight, Copy, Check } from 'lucide-react';

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
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [usePasswordMethod, setUsePasswordMethod] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  if (!isOpen) return null;

  const handlePasswordLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const inputVal = password.trim();
    if (!inputVal) {
      setError('Please enter the administrator password.');
      return;
    }

    const success = loginWithSecret(inputVal);
    if (success) {
      onSuccess();
      onClose();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleError(null);
    setLoadingGoogle(true);
    try {
      const user = await loginWithGoogle();
      if (!user) {
        // Redirect flow in progress
        return;
      }
      if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        setGoogleError(`Access denied. ${user.email} is not authorized. Super Admin privileges are restricted exclusively to ${adminEmail}.`);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('auth/unauthorized-domain')) {
        setGoogleError(
          `Domain "${currentHost}" is not authorized by Firebase Auth yet. Outside AI Studio, Google requires adding this domain to Firebase Console > Authentication > Settings > Authorized Domains. You can immediately log in using the Admin Password below.`
        );
        setUsePasswordMethod(true);
      } else if (errMsg.includes('auth/popup-closed-by-user')) {
        setGoogleError('Sign-in popup was closed before completion. You can also sign in with your Admin Password below.');
      } else if (errMsg.includes('auth/popup-blocked')) {
        setGoogleError('Popup was blocked by your browser. Please allow popups or use your Admin Password below.');
        setUsePasswordMethod(true);
      } else {
        setGoogleError(errMsg || 'Google authentication failed. Please use your Admin Password below.');
        setUsePasswordMethod(true);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0B0B0B] border border-[#242424] max-w-md w-full p-6 sm:p-8 rounded-none relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-[#707070] hover:text-[#F5F5F5] transition-colors p-1.5 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#141414] border border-[#2B2B2B] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-widest text-[#F5F5F5] uppercase font-mono">
              TURVEX ADMIN PORTAL
            </h3>
            <p className="text-[11px] text-[#888888]">
              Authorized Super Administrator Access
            </p>
          </div>
        </div>

        {/* Super Admin Notice */}
        <div className="mb-5 p-3 bg-[#111111] border border-[#222222] text-xs">
          <div className="flex items-center gap-2 text-white font-mono text-[11px] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider">Designated Super Admin</span>
          </div>
          <p className="text-[11px] text-[#A1A1A1] font-mono break-all">
            {adminEmail}
          </p>
        </div>

        {/* Primary Method: Google Super Admin Login */}
        <div className="space-y-4">
          {googleError && (
            <div className="p-3 bg-[#1A0E0E] border border-[#4A1E1E] space-y-2.5 text-xs text-[#FF9999]">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6666] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-sans">{googleError}</span>
              </div>

              {currentHost && (
                <div className="pt-2 border-t border-[#3A1818] flex items-center justify-between gap-2">
                  <div className="truncate font-mono text-[10px] text-[#A1A1A1]">
                    Domain: <span className="text-white select-all">{currentHost}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentHost);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-[#2B1414] hover:bg-[#3D1A1A] border border-[#552222] hover:border-[#883333] text-[10px] text-white font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Copy this domain to add into Firebase Console Authorized Domains"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#A1A1A1]" />
                        <span>Copy Domain</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full py-3.5 px-4 bg-white hover:bg-[#EBEBEB] text-[#050505] text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingGoogle ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1F1F1F]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-[#0B0B0B] px-2 text-[#707070]">
              {usePasswordMethod ? 'Direct Administrator Key' : 'Or Admin Password'}
            </span>
          </div>
        </div>

        {/* Alternate: Password Login */}
        {!usePasswordMethod ? (
          <button
            onClick={() => setUsePasswordMethod(true)}
            className="w-full py-2.5 px-3 bg-[#111111] hover:bg-[#161616] border border-[#2B2B2B] hover:border-[#3D3D3D] text-[#CCCCCC] text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer font-mono"
          >
            <Key className="w-3.5 h-3.5 text-[#888888]" />
            <span>Sign In with Password</span>
          </button>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#1A0E0E] border border-[#4A1E1E] flex items-start gap-2.5 text-xs text-[#FF9999]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FF6666] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{error}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block font-mono">
                  Admin Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#2A2A2A] focus:border-white text-xs text-white placeholder-[#555555] font-mono outline-none transition-colors"
                  placeholder="admin"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] block font-mono font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#707070] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter password"
                  autoFocus
                  className="w-full px-3 py-2 bg-[#050505] border border-[#333333] focus:border-white text-xs text-white placeholder-[#555555] font-mono outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Authenticate Key</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setUsePasswordMethod(false)}
              className="w-full text-center text-[10px] uppercase font-mono text-[#707070] hover:text-white transition-colors cursor-pointer pt-1"
            >
              Hide Password Form
            </button>
          </div>
        )}

        <div className="pt-5 text-[10px] text-[#555555] text-center font-mono">
          TURVEX ARCHIVES &bull; ENCRYPTED ACCESS ONLY
        </div>
      </div>
    </div>
  );
};
