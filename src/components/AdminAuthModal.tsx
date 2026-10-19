import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const { loginWithGoogle, adminEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
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
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0B0B0B] border border-[#242424] max-w-md w-full p-8 rounded-none relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#707070] hover:text-[#F5F5F5] transition-colors"
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

        {error && (
          <div className="mb-6 p-3 bg-[#160b0b] border border-[#3b1818] flex items-start gap-2.5 text-xs text-[#E5A0A0]">
            <AlertCircle className="w-4 h-4 text-[#FF8888] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-xs text-[#A1A1A1] leading-relaxed font-light">
            Sign in using the verified Google OAuth account configured for this archive. Administrative roles and permissions are enforced server-side.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#F5F5F5] text-[#050505] hover:bg-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating with Google...' : 'Sign In with Google'}</span>
          </button>

          <div className="pt-2 text-[11px] text-[#707070] text-center space-y-1">
            <p>Protected by server-side authorization</p>
            <p className="font-mono text-[10px] text-[#555555]">{adminEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
