import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Totals } from '@/components/store/Basket';
import { formatNaira } from '@/lib/money';
import { go } from '@/lib/nav';
import { readOrder } from '@/lib/orders';
import { subtotalOf } from '@/lib/pricing';

type OrderItem = { id: string; name: string; price: number; quantity: number };
type OrderRecord = {
  emailSent?: boolean;
  order?: {
    id: string;
    items?: OrderItem[];
    delivery_address?: string;
    phone?: string;
    status?: string;
  };
};

export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const [record, setRecord] = useState<OrderRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    readOrder(orderId).then((value) => {
      if (!active) return;
      setRecord(value);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (!loaded) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>Loading the order…</Text>
      </View>
    );
  }

  const order = record?.order;
  if (!order) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>We can’t show that order on this device.</Text>
        <Text style={styles.muted}>If you just placed it, the confirmation was saved on the device that checked out.</Text>
        <Pressable style={styles.button} onPress={() => go('/shop')}>
          <Text style={styles.buttonText}>Back to the shop</Text>
        </Pressable>
      </View>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const subtotal = subtotalOf(order.items || []);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Order {shortId}</Text>
      <Text style={styles.title}>Thank you. We’re packing the bag.</Text>
      <Text style={styles.lede}>
        {record?.emailSent
          ? 'A confirmation is on its way to your inbox, with the items, total, and delivery address.'
          : 'The order is saved. The confirmation email could not be sent — we’ll still deliver from the address you gave.'}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Deliver to</Text>
        <Text style={styles.metaValue}>{order.delivery_address}</Text>
        <Text style={styles.metaLabel}>Phone</Text>
        <Text style={styles.metaValue}>{order.phone}</Text>
        <Text style={styles.metaLabel}>Status</Text>
        <Text style={styles.metaValue}>{order.status}</Text>
      </View>
      <View style={styles.items}>
        {(order.items || []).map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemName}>
              {item.name} × {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>{formatNaira(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>
      <Totals subtotal={subtotal} />
      <Pressable style={styles.button} onPress={() => go('/shop')}>
        <Text style={styles.buttonText}>Continue shopping</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f3f1ec' },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  screen: { flex: 1, backgroundColor: '#f3f1ec', padding: 16, gap: 12 },
  kicker: { color: '#5c564e', fontWeight: '600' },
  title: { color: '#161513', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  lede: { color: '#5c564e', fontSize: 16, lineHeight: 24 },
  muted: { color: '#5c564e', lineHeight: 21 },
  meta: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, gap: 4 },
  metaLabel: { color: '#5c564e', fontSize: 13, marginTop: 6 },
  metaValue: { color: '#161513', fontSize: 16 },
  items: { gap: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  itemName: { flex: 1, color: '#161513' },
  itemPrice: { color: '#161513', fontWeight: '700' },
  button: { backgroundColor: '#12261f', borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#f7f3ea', fontWeight: '700' },
});
