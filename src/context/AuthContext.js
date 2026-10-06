import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { persistGoogleUser } from '@/lib/api';
import { signInWithGoogle } from '@/lib/googleAuth';
import { clearSession, decodeJwt, readSession, writeSession } from '@/lib/session';
import { supabase } from '@/services/supabase';

/**
 * @typedef {{
 *   id: string | null,
 *   googleId?: string,
 *   name: string,
 *   email: string,
 *   picture: string,
 *   credential: string,
 *   exp?: number,
 *   persisted?: boolean,
 * }} TajUser
 */

/**
 * @typedef {{
 *   user: TajUser | null,
 *   ready: boolean,
 *   signInOpen: boolean,
 *   authError: string,
 *   setAuthError: (message: string) => void,
 *   openSignIn: () => void,
 *   closeSignIn: () => void,
 *   startGoogleSignIn: () => Promise<void>,
 *   googleReady: boolean,
 *   hasGoogleClient: boolean,
 *   signOut: () => Promise<void>,
 * }} AuthContextValue
 */

/** @type {import('react').Context<AuthContextValue | null>} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    readSession().then((session) => {
      if (active) setUser(session);
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const openSignIn = useCallback(() => {
    setAuthError('');
    setSignInOpen(true);
  }, []);

  const closeSignIn = useCallback(() => setSignInOpen(false), []);

  const applySupabaseSession = useCallback(async (session, idToken) => {
    const metadata = session?.user?.user_metadata || {};
    const email = session?.user?.email || metadata.email || '';
    if (!email) throw new Error('Google did not return an email address.');

    const credential = idToken || session.access_token;
    let exp = session.expires_at;
    let googleId = metadata.provider_id || metadata.sub;
    if (idToken) {
      try {
        const claims = decodeJwt(idToken);
        exp = claims.exp || exp;
        googleId = claims.sub || googleId;
      } catch {
        googleId = metadata.provider_id || metadata.sub;
      }
    }

    const profile = {
      id: session.user.id,
      googleId,
      name: metadata.full_name || metadata.name || email,
      email,
      picture: metadata.avatar_url || metadata.picture || '',
      credential,
      exp,
      persisted: false,
    };

    try {
      const result = await persistGoogleUser(credential);
      if (result?.user) {
        profile.id = result.user.id || profile.id;
        profile.name = result.user.name || profile.name;
        profile.email = result.user.email || profile.email;
        profile.persisted = true;
      }
    } catch (error) {
      if (error.code !== 'not_configured' && error.status !== 404) {
        console.warn('Could not store the Google profile yet:', error.message);
      }
    }

    await writeSession(profile);
    setUser(profile);
    setSignInOpen(false);
    return profile;
  }, []);

  const startGoogleSignIn = useCallback(async () => {
    setAuthError('');
    try {
      const signedIn = await signInWithGoogle();
      if (!signedIn?.session) return;
      await applySupabaseSession(signedIn.session, signedIn.idToken);
    } catch (error) {
      setAuthError(error.message || 'Google sign-in failed');
    }
  }, [applySupabaseSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      signInOpen,
      authError,
      setAuthError,
      openSignIn,
      closeSignIn,
      startGoogleSignIn,
      googleReady: true,
      hasGoogleClient: true,
      signOut,
    }),
    [user, ready, signInOpen, authError, openSignIn, closeSignIn, startGoogleSignIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
