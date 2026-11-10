import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, ShieldCheck, AlertCircle, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';

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
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);

  if (!isOpen) return null;

  const handlePasswordLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const inputVal = password.trim();
    if (!inputVal) {
      setError('يرجى إدخال كلمة المرور (rogy) / Please enter the admin password.');
      return;
    }

    const success = loginWithSecret(inputVal);
    if (success) {
      onSuccess();
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة! كلمة المرور هي: rogy / Incorrect password! Password is: rogy');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleError(null);
    setLoadingGoogle(true);
    try {
      const user = await loginWithGoogle();
      if (!user) {
        throw new Error('Authentication was cancelled.');
      }
      if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        setGoogleError(`Access denied. ${user.email} is not authorized. Only ${adminEmail} has administrator access.`);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('auth/unauthorized-domain')) {
        setGoogleError('Domain not authorized for Google OAuth. Please use the Admin Password (rogy) above.');
      } else if (errMsg.includes('auth/popup-closed-by-user')) {
        setGoogleError('Popup was closed before sign-in completed.');
      } else {
        setGoogleError(errMsg || 'Google authentication failed.');
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
          className="absolute top-5 right-5 text-[#707070] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 bg-[#141414] border border-[#2B2B2B] flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest text-[#F5F5F5] uppercase">
              TURVEX ADMIN ACCESS
            </h3>
            <p className="text-[11px] text-[#888888]">
              تسجيل دخول المشرف / لوحة التحكم
            </p>
          </div>
        </div>

        {/* Primary Form: Password Login (rogy) */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#1A0E0E] border border-[#4A1E1E] flex items-start gap-2.5 text-xs text-[#FF9999]">
              <AlertCircle className="w-4 h-4 text-[#FF6666] shrink-0 mt-0.5" />
              <span className="leading-relaxed font-sans">{error}</span>
            </div>
          )}

          {/* Quick info banner showing password */}
          <div className="p-3 bg-[#111111] border border-[#262626] flex items-center justify-between text-xs">
            <span className="text-[#888888] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-white" />
              <span>Admin Password:</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setPassword('rogy');
                setError(null);
              }}
              className="px-2 py-0.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#3A3A3A] text-white text-[11px] font-mono tracking-wider transition-colors cursor-pointer"
              title="Click to insert 'rogy'"
            >
              rogy (اضغط هنا للتعبئة)
            </button>
          </div>

          {/* Username / Identifier */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#888888] block font-mono">
              Username / اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#050505] border border-[#2A2A2A] focus:border-white text-xs text-white placeholder-[#555555] font-mono outline-none transition-colors"
              placeholder="admin"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider text-[#CCCCCC] block font-mono font-semibold">
                Password / كلمة المرور <span className="text-white font-mono font-bold">(rogy)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#707070] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="أدخل الباسورد rogy"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#050505] border border-[#333333] focus:border-white text-xs text-white placeholder-[#555555] font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-white hover:bg-[#EBEBEB] text-[#050505] text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg mt-2 active:scale-[0.99]"
          >
            <span>دخول لوحة التحكم / Enter Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Alternative: Google OAuth */}
        <div className="mt-6 pt-5 border-t border-[#1C1C1C]">
          {!showGoogleAuth ? (
            <button
              onClick={() => setShowGoogleAuth(true)}
              className="w-full text-center text-[11px] text-[#707070] hover:text-[#A1A1A1] transition-colors py-1 cursor-pointer font-mono"
            >
              Or sign in with Google account ({adminEmail})
            </button>
          ) : (
            <div className="space-y-3">
              {googleError && (
                <div className="p-2.5 bg-[#1A0E0E] border border-[#4A1E1E] text-[11px] text-[#FF9999]">
                  {googleError}
                </div>
              )}
              <button
                onClick={handleGoogleLogin}
                disabled={loadingGoogle}
                className="w-full py-2.5 px-3 bg-[#111111] hover:bg-[#1A1A1A] border border-[#2B2B2B] text-[#CCCCCC] text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>{loadingGoogle ? 'Connecting...' : 'Sign In with Google Account'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 text-[10px] text-[#555555] text-center font-mono">
          TURVEX ARCHIVES &bull; PASSWORD: rogy
        </div>
      </div>
    </div>
  );
};

