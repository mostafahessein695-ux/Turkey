import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  isUserAdmin, 
  verifyAndProvisionServerAdmin, 
  ADMIN_EMAIL 
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  adminEmail: string;
  isVerifyingAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  loginWithGoogle: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
  adminEmail: ADMIN_EMAIL,
  isVerifyingAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsVerifyingAdmin(true);
        // Server-side provisioning and verification against Firestore
        const isVerifiedAdmin = await verifyAndProvisionServerAdmin(currentUser);
        setIsAdmin(isVerifiedAdmin);
        setIsVerifyingAdmin(false);
      } else {
        setIsAdmin(false);
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
      setIsAdmin(isVerifiedAdmin);
      setIsVerifyingAdmin(false);
    } else {
      setIsAdmin(false);
    }
    return loggedUser;
  };

  const handleLogout = async () => {
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
