import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BasketLines, Totals } from '@/components/store/Basket';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { go } from '@/lib/nav';

export default function CartScreen() {
  const { user, openSignIn } = useAuth();
  const { items, subtotal, isLoading, error } = useCart();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Your basket</Text>
      <Text style={styles.title}>Ready when you are</Text>

      {isLoading ? (
        <Text style={styles.muted}>Loading the basket…</Text>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.heading}>The basket is empty.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.muted}>
            {user
              ? 'The shelf is stocked — garri, drinks, bread, and the rest of the weekly run.'
              : 'Sign in with Google and this basket stays on your account, ready on this phone.'}
          </Text>
          {user ? (
            <Pressable style={styles.button} onPress={() => go('/shop')}>
              <Text style={styles.buttonText}>Shop the shelf</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.button} onPress={openSignIn}>
              <Text style={styles.buttonText}>Sign in with Google</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.stack}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <BasketLines items={items} editable />
          <Totals subtotal={subtotal} />
          <Pressable style={styles.button} onPress={() => go('/checkout')}>
            <Text style={styles.buttonText}>Checkout</Text>
          </Pressable>
          <Pressable onPress={() => go('/shop')}>
            <Text style={styles.link}>Continue shopping</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f1ec' },
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  kicker: { color: '#5c564e', fontWeight: '600' },
  title: { color: '#161513', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  heading: { color: '#161513', fontSize: 22, fontWeight: '700' },
  muted: { color: '#5c564e', lineHeight: 21 },
  error: { color: '#9a3412' },
  empty: { gap: 12, paddingTop: 8 },
  stack: { gap: 16 },
  button: {
    backgroundColor: '#12261f',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#f7f3ea', fontWeight: '700' },
  link: { color: '#12261f', fontWeight: '700', textAlign: 'center' },
});
