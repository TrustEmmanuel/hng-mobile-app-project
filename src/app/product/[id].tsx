import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ProductCard, type ShelfProduct } from '@/components/store/ProductCard';
import { ProductVisual } from '@/components/store/ProductVisual';
import { Qty } from '@/components/store/Qty';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { categories } from '@/data/products';
import { formatNaira } from '@/lib/money';
import { go } from '@/lib/nav';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const { products, loading } = useCatalog();
  const { addItem } = useCart();
  const product = (products as ShelfProduct[]).find((item) => item.id === productId);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setQty(1);
    setNotice('');
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>Loading the shelf…</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>That item isn’t on the shelf.</Text>
        <Pressable style={styles.button} onPress={() => go('/shop')}>
          <Text style={styles.buttonText}>Back to the shop</Text>
        </Pressable>
      </View>
    );
  }

  const max = Math.min(12, product.stock_quantity);
  const soldOut = max <= 0;
  const category = categories.find((item) => item.name === product.category);
  const related = (products as ShelfProduct[])
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  async function onAdd() {
    if (!product) return;
    const added = await addItem(product, qty);
    if (added === true) setNotice('Added to the basket.');
    else if (added === false) setNotice('That’s as many as we can pack.');
    else if (added == null) setNotice('Could not update the basket.');
    else setNotice('');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.crumb}>
        Shop{category ? ` / ${product.category}` : ''}
      </Text>
      <Pressable onPress={() => go(category ? `/shop?category=${category.slug}` : '/shop')}>
        <Text style={styles.textLink}>{category ? product.category : 'Back to the shop'}</Text>
      </Pressable>
      <ProductVisual product={product} />
      <Text style={styles.kicker}>{product.category}</Text>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{formatNaira(product.price)}</Text>
      <Text style={styles.description}>{product.description}</Text>
      {soldOut ? (
        <Text style={styles.error}>Out of stock.</Text>
      ) : (
        <View style={styles.buyRow}>
          <Qty value={qty} max={max} onChange={setQty} />
          <Pressable style={styles.button} onPress={onAdd}>
            <Text style={styles.buttonText}>Add to basket</Text>
          </Pressable>
        </View>
      )}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {!soldOut && product.stock_quantity < 8 ? <Text style={styles.stock}>Only {product.stock_quantity} left</Text> : null}

      {related.length > 0 ? (
        <View style={styles.related}>
          <Text style={styles.relatedTitle}>Also in {product.category}</Text>
          <View style={styles.grid}>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f3f1ec' },
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  screen: { flex: 1, backgroundColor: '#f3f1ec', padding: 16, gap: 12 },
  crumb: { color: '#5c564e' },
  textLink: { color: '#12261f', fontWeight: '700' },
  kicker: { color: '#5c564e', fontWeight: '600', marginTop: 8 },
  title: { color: '#161513', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  price: { color: '#12261f', fontSize: 22, fontWeight: '700' },
  description: { color: '#5c564e', fontSize: 16, lineHeight: 24 },
  muted: { color: '#5c564e', padding: 16 },
  error: { color: '#9a3412' },
  notice: { color: '#12261f', fontWeight: '600' },
  stock: { color: '#9a3412' },
  buyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  button: { backgroundColor: '#12261f', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: '#f7f3ea', fontWeight: '700' },
  related: { marginTop: 16, gap: 12 },
  relatedTitle: { color: '#161513', fontSize: 22, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
