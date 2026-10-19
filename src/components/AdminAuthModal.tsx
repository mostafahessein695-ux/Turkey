import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, ShieldCheck, AlertCircle, Copy, Check, ExternalLink, Globe } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

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
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedHostname, setCopiedHostname] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectId = firebaseConfig.projectId;
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
        setError('Firebase Authentication: This domain is not authorized yet.');
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
                  Domain Authorization Required
                </p>
                <p className="text-[11px] text-[#C4B28A] mt-0.5">
                  Firebase rejected the sign-in request because this hostname is not yet in the project's Authorized Domains list.
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

            <div className="space-y-1.5 text-[11px] text-[#A6956D] leading-relaxed">
              <p className="font-semibold text-[#F7E7C4]">To authorize this domain:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>
                  Open your Firebase project:{' '}
                  <a
                    href={consoleAuthSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white hover:text-[#F5F5F5] inline-flex items-center gap-1 font-mono"
                  >
                    <span>Authentication → Settings</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Scroll down to the <strong>Authorized domains</strong> section.</li>
                <li>Click <strong>Add domain</strong>.</li>
                <li>Paste <code className="bg-[#1A1A1A] text-white px-1 py-0.5">{currentHostname}</code> and click <strong>Add</strong>.</li>
                <li>Return here and click <strong>Sign In with Google</strong> again.</li>
              </ol>
            </div>
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
