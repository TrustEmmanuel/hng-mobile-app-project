import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'tajmart.session';

function decodeSegment(segment) {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const normalized = padded.padEnd(Math.ceil(padded.length / 4) * 4, '=');
  const binary = globalThis.atob(normalized);
  return decodeURIComponent(
    binary
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
}

export function decodeJwt(token) {
  const segment = token.split('.')[1];
  if (!segment) throw new Error('Invalid Google credential');
  return JSON.parse(decodeSegment(segment));
}

export function sessionValid(session) {
  if (!session?.exp) return false;
  return session.exp * 1000 > Date.now() + 30_000;
}

export async function readSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.credential || !session?.email) return null;
    if (!sessionValid(session)) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function writeSession(session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function googleClientId() {
  const value = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (!value || /your-client-id|your-id/i.test(value)) return '';
  return value.trim();
}
