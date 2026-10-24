import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const getInitialFirebaseConfig = () => {
  try {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('statementflow_custom_firebase_config');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed.apiKey && (parsed.projectId || parsed.authDomain)) {
          return parsed;
        }
      }
    }
  } catch {}
  return firebaseConfig;
};

const activeConfig = getInitialFirebaseConfig();

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
export const auth = getAuth(app);

export const getActiveProjectId = (): string => {
  return activeConfig.projectId || 'gen-lang-client-0056967119';
};

export const setCustomFirebaseConfig = (config: Record<string, string> | null) => {
  try {
    if (config) {
      localStorage.setItem('statementflow_custom_firebase_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('statementflow_custom_firebase_config');
    }
  } catch {}
};

export const getCustomFirebaseConfig = (): Record<string, string> | null => {
  try {
    const raw = localStorage.getItem('statementflow_custom_firebase_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.readonly'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// Memory caching for OAuth Access Token (strictly in-memory, never in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initializes Firebase Auth state listener and keeps in-memory token state synced.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token is lost from memory (e.g. page refresh), require re-sign-in to obtain fresh Workspace OAuth token
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Signs in with Google using Firebase Auth popup to obtain user profile and Workspace access token.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token from Firebase credential.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns the in-memory cached access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sets or updates the in-memory access token.
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Signs the user out and wipes in-memory tokens.
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};
