import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

import { supabase } from '@/services/supabase';

if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}

export function authRedirectUri() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (
    Platform.OS !== 'web' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    hostUri &&
    !/^(localhost|127\.0\.0\.1)(:|$)/.test(hostUri)
  ) {
    return `exp://${hostUri}/--/oauthredirect`;
  }

  return makeRedirectUri({
    scheme: 'tajmartmobile',
    path: 'oauthredirect',
  });
}

export async function signInWithGoogle() {
  const redirectUri = authRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('Supabase did not return a Google sign-in URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
  if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') {
    const error = new Error(
      `Supabase sent the browser to localhost. In Authentication → URL Configuration, set Site URL and add a Redirect URL for: ${redirectUri}`,
    );
    error.redirectUri = redirectUri;
    throw error;
  }
  if (result.type !== 'success' || !('url' in result) || !result.url) {
    throw new Error('Google sign-in did not return to the app.');
  }

  return createSessionFromUrl(result.url);
}

export async function createSessionFromUrl(url) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  if (params.error) {
    throw new Error(params.error_description || params.error);
  }

  const idToken = params.id_token || '';

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return { session: data.session, idToken };
  }

  if (!params.access_token) {
    throw new Error('Google sign-in did not return a session.');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });
  if (error) throw error;
  return { session: data.session, idToken };
}
