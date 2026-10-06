import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as ExpoCrypto from 'expo-crypto';
import { Platform } from 'react-native';

const cryptoRef = globalThis.crypto || {};
if (typeof cryptoRef.getRandomValues !== 'function') {
  cryptoRef.getRandomValues = ExpoCrypto.getRandomValues;
}
if (!cryptoRef.subtle?.digest) {
  cryptoRef.subtle = {
    async digest(_algorithm, data) {
      const bytes =
        data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, bytes);
    },
  };
}
if (!globalThis.crypto) {
  globalThis.crypto = cryptoRef;
}

const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

const authStorage = {
  getItem: (key) => {
    if (isWebServer) return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (isWebServer) return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (isWebServer) return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add both to your environment before starting the app.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
