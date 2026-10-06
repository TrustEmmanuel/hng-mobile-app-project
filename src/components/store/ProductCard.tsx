import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/money';
import { go } from '@/lib/nav';
import { ProductVisual } from '@/components/store/ProductVisual';

export type ShelfProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string | null;
  stock_quantity: number;
};

export function ProductCard({ product }: { product: ShelfProduct }) {
  const { addItem } = useCart();
  const [label, setLabel] = useState('Add');
  const soldOut = product.stock_quantity <= 0;

  async function onAdd() {
    const added = await addItem(product, 1);
    if (added === true) setLabel('Added');
    else if (added === false) setLabel('Max');
    else if (added == null) setLabel('Retry');
    setTimeout(() => setLabel('Add'), 900);
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={() => go(`/product/${product.id}`)} accessibilityLabel={product.name}>
        <ProductVisual product={product} />
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.kicker}>{product.category}</Text>
        <Pressable onPress={() => go(`/product/${product.id}`)}>
          <Text style={styles.name}>{product.name}</Text>
        </Pressable>
        <View style={styles.row}>
          <Text style={styles.price}>{formatNaira(product.price)}</Text>
          <Pressable style={[styles.button, soldOut && styles.disabled]} onPress={onAdd} disabled={soldOut}>
            <Text style={styles.buttonText}>{soldOut ? 'Out' : label}</Text>
          </Pressable>
        </View>
        {product.stock_quantity > 0 && product.stock_quantity < 8 ? (
          <Text style={styles.stock}>Only {product.stock_quantity} left</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
  },
  body: {
    paddingTop: 10,
    gap: 4,
  },
  kicker: {
    color: '#5c564e',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    color: '#161513',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  price: {
    color: '#161513',
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#12261f',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#f7f3ea',
    fontSize: 13,
    fontWeight: '700',
  },
  stock: {
    color: '#9a3412',
    fontSize: 12,
    marginTop: 4,
  },
});
