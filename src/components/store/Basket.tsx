import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductVisual } from '@/components/store/ProductVisual';
import { Qty } from '@/components/store/Qty';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/money';
import { go } from '@/lib/nav';
import { deliveryFee } from '@/lib/pricing';

type Line = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  stock_quantity?: number;
};

export function BasketLines({ items, editable = false }: { items: Line[]; editable?: boolean }) {
  const { setQty, remove } = useCart();

  return (
    <View style={styles.lines}>
      {items.map((item) => (
        <View key={item.id} style={styles.line}>
          <Pressable style={styles.thumb} onPress={() => go(`/product/${item.id}`)}>
            <ProductVisual product={item} />
          </Pressable>
          <View style={styles.copy}>
            <Pressable onPress={() => go(`/product/${item.id}`)}>
              <Text style={styles.name}>{item.name}</Text>
            </Pressable>
            <Text style={styles.price}>{formatNaira(item.price)}</Text>
            {editable ? (
              <View style={styles.actions}>
                <Qty
                  value={item.quantity}
                  max={item.stock_quantity || 12}
                  onChange={(quantity) => setQty(item.id, quantity)}
                />
                <Pressable onPress={() => remove(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.muted}>Qty {item.quantity}</Text>
            )}
          </View>
          <Text style={styles.total}>{formatNaira(item.price * item.quantity)}</Text>
        </View>
      ))}
    </View>
  );
}

export function Totals({ subtotal }: { subtotal: number }) {
  const delivery = deliveryFee(subtotal);
  const total = subtotal + delivery;

  return (
    <View style={styles.totals}>
      <View style={styles.totalRow}>
        <Text style={styles.muted}>Subtotal</Text>
        <Text style={styles.amount}>{formatNaira(subtotal)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.muted}>Delivery</Text>
        <Text style={styles.amount}>{delivery === 0 ? 'Free' : formatNaira(delivery)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.grand}>Total</Text>
        <Text style={styles.grand}>{formatNaira(total)}</Text>
      </View>
      <Text style={styles.note}>Free delivery on baskets from ₦15,000. Otherwise ₦1,200 across Lagos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lines: {
    gap: 14,
  },
  line: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
  },
  thumb: {
    width: 84,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: '#161513',
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    color: '#5c564e',
    fontSize: 13,
  },
  actions: {
    marginTop: 8,
    gap: 8,
    alignItems: 'flex-start',
  },
  remove: {
    color: '#9a3412',
    fontSize: 13,
    fontWeight: '600',
  },
  total: {
    color: '#161513',
    fontWeight: '700',
  },
  totals: {
    gap: 8,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muted: {
    color: '#5c564e',
    fontSize: 14,
  },
  amount: {
    color: '#161513',
    fontSize: 14,
  },
  grand: {
    color: '#161513',
    fontSize: 18,
    fontWeight: '700',
  },
  note: {
    color: '#5c564e',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
