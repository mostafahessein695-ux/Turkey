import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  setDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Dynamic configuration supporting both Vercel Environment Variables and local config
export const activeFirebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId || '',
};

const app = initializeApp(activeFirebaseConfig);
const targetDbId = activeFirebaseConfig.firestoreDatabaseId;
export const db = (targetDbId && targetDbId !== '(default)') 
  ? getFirestore(app, targetDbId) 
  : getFirestore(app);
export const auth = getAuth(app);

export const ADMIN_EMAIL = 'mostafahessein695@gmail.com';
export const ADMIN_SECRET_KEY = (import.meta.env.VITE_ADMIN_SECRET_KEY as string) || 'mostafa695';

export function verifyAdminSecret(secret: string): boolean {
  if (!secret) return false;
  return secret.trim() === ADMIN_SECRET_KEY.trim();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by Firebase integration guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In failed:', err);
    throw err;
  }
}

export async function logoutUser() {
  await fbSignOut(auth);
}

export async function verifyAndProvisionServerAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;

  // Verify authorized admin account
  if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return false;
  }

  // Verify email verification flag from provider token
  if (!user.emailVerified) {
    return false;
  }

  try {
    const adminRef = doc(db, 'admins', user.uid);
    // Provision/update server document
    await setDoc(adminRef, {
      email: user.email.toLowerCase(),
      role: 'admin',
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Re-verify against live Firestore server
    const serverCheck = await getDocFromServer(adminRef);
    if (serverCheck.exists() && serverCheck.data()?.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.error('Server-side admin verification/provisioning failed:', err);
    return false;
  }

  return false;
}

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && !!user.emailVerified;
}

