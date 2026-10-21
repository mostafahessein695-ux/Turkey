import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  isUserAdmin, 
  verifyAndProvisionServerAdmin, 
  verifyAdminSecret,
  ADMIN_EMAIL 
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithSecret: (secret: string) => boolean;
  logout: () => Promise<void>;
  adminEmail: string;
  isVerifyingAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  loginWithGoogle: async () => { throw new Error('Not implemented'); },
  loginWithSecret: () => false,
  logout: async () => {},
  adminEmail: ADMIN_EMAIL,
  isVerifyingAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('myworld_admin_authenticated') === 'true' ||
        localStorage.getItem('myworld_admin_authenticated') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsVerifyingAdmin(true);
        // Server-side provisioning and verification against Firestore
        const isVerifiedAdmin = await verifyAndProvisionServerAdmin(currentUser);
        if (isVerifiedAdmin) {
          try {
            sessionStorage.setItem('myworld_admin_authenticated', 'true');
            localStorage.setItem('myworld_admin_authenticated', 'true');
          } catch {}
          setIsAdmin(true);
        }
        setIsVerifyingAdmin(false);
      } else {
        try {
          const isStoredAdmin = (
            sessionStorage.getItem('myworld_admin_authenticated') === 'true' ||
            localStorage.getItem('myworld_admin_authenticated') === 'true'
          );
          setIsAdmin(isStoredAdmin);
        } catch {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginWithGoogle = async () => {
    const loggedUser = await loginWithGoogle();
    if (loggedUser && loggedUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsVerifyingAdmin(true);
      const isVerifiedAdmin = await verifyAndProvisionServerAdmin(loggedUser);
      if (isVerifiedAdmin) {
        try {
          sessionStorage.setItem('myworld_admin_authenticated', 'true');
          localStorage.setItem('myworld_admin_authenticated', 'true');
        } catch {}
        setIsAdmin(true);
      }
      setIsVerifyingAdmin(false);
    } else {
      setIsAdmin(false);
    }
    return loggedUser;
  };

  const handleLoginWithSecret = (secret: string): boolean => {
    const isValid = verifyAdminSecret(secret);
    if (isValid) {
      try {
        sessionStorage.setItem('myworld_admin_authenticated', 'true');
        localStorage.setItem('myworld_admin_authenticated', 'true');
      } catch {}
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('myworld_admin_authenticated');
      localStorage.removeItem('myworld_admin_authenticated');
    } catch {}
    setIsAdmin(false);
    await logoutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginWithGoogle: handleLoginWithGoogle,
        loginWithSecret: handleLoginWithSecret,
        logout: handleLogout,
        adminEmail: ADMIN_EMAIL,
        isVerifyingAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
