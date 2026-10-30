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

// OAuth Access Token session persistence
const OAUTH_TOKEN_KEY = 'statementflow_google_access_token';
const OAUTH_USER_EMAIL_KEY = 'statementflow_google_user_email';

let cachedAccessToken: string | null = null;
let isSigningIn = false;

const getStoredAccessToken = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(OAUTH_TOKEN_KEY);
    }
  } catch {}
  return null;
};

const storeAccessToken = (token: string, email?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OAUTH_TOKEN_KEY, token);
      if (email) {
        localStorage.setItem(OAUTH_USER_EMAIL_KEY, email);
      }
    }
  } catch (e) {
    console.warn('Failed to persist OAuth access token', e);
  }
};

const clearStoredAccessToken = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(OAUTH_TOKEN_KEY);
      localStorage.removeItem(OAUTH_USER_EMAIL_KEY);
    }
  } catch (e) {
    console.warn('Failed to remove persisted OAuth access token', e);
  }
};

/**
 * Initializes Firebase Auth state listener and keeps session & token state synced across refreshes.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Check in-memory cache first, then restore persisted token from localStorage
      const token = cachedAccessToken || getStoredAccessToken();
      if (token) {
        cachedAccessToken = token;
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else if (!isSigningIn) {
        // Only trigger failure if there is truly no token and user is not currently in sign-in flow
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      clearStoredAccessToken();
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
    storeAccessToken(credential.accessToken, result.user.email);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns the access token from in-memory cache or persisted session.
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const stored = getStoredAccessToken();
  if (stored) {
    cachedAccessToken = stored;
    return stored;
  }
  return null;
};

/**
 * Sets or updates the access token in memory and persisted storage.
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (token) {
    storeAccessToken(token);
  } else {
    clearStoredAccessToken();
  }
};

/**
 * Signs the user out, clears Firebase Auth session, and wipes persisted tokens.
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
    clearStoredAccessToken();
  }
};
