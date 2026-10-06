import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ProductCard, type ShelfProduct } from '@/components/store/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { categories, categoryBySlug } from '@/data/products';
import { go } from '@/lib/nav';

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default function ShopScreen() {
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const slug = first(params.category);
  const query = first(params.q);
  const { products, loading } = useCatalog();
  const category = categoryBySlug(slug);
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (products as ShelfProduct[]).filter((product) => {
      const categoryOk = !category || product.category === category.name;
      const queryOk = !term || product.name.toLowerCase().includes(term);
      return categoryOk && queryOk;
    });
  }, [products, category, query]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>The shelf</Text>
      <View style={styles.head}>
        <Text style={styles.title}>{category?.name || 'Everything in store'}</Text>
        <Text style={styles.count}>{loading ? 'Loading' : visible.length === 1 ? '1 item' : `${visible.length} items`}</Text>
      </View>
      {category ? <Text style={styles.blurb}>{category.blurb}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Pressable style={[styles.filter, !slug && styles.filterOn]} onPress={() => go('/shop')}>
          <Text style={[styles.filterText, !slug && styles.filterTextOn]}>All</Text>
        </Pressable>
        {categories.map((item) => (
          <Pressable
            key={item.slug}
            style={[styles.filter, slug === item.slug && styles.filterOn]}
            onPress={() => go(`/shop?category=${item.slug}`)}>
            <Text style={[styles.filterText, slug === item.slug && styles.filterTextOn]}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => go(draft.trim() ? `/shop?q=${encodeURIComponent(draft.trim())}${slug ? `&category=${slug}` : ''}` : slug ? `/shop?category=${slug}` : '/shop')}
        placeholder="Filter by name"
        placeholderTextColor="#8a837a"
        style={styles.search}
        returnKeyType="search"
      />

      {loading ? (
        <View style={styles.grid}>
          {Array.from({ length: 4 }, (_, index) => (
            <View key={index} style={styles.skeleton} />
          ))}
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.title}>Nothing under that name.</Text>
          <Text style={styles.blurb}>Try garri, bread, or cola — or clear the filter.</Text>
          <Pressable style={styles.button} onPress={() => go('/shop')}>
            <Text style={styles.buttonText}>Clear search</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f1ec' },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  kicker: { color: '#5c564e', fontWeight: '600' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  title: { flex: 1, color: '#161513', fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  count: { color: '#5c564e' },
  blurb: { color: '#5c564e', lineHeight: 21 },
  filters: { gap: 8, paddingVertical: 4 },
  filter: { borderRadius: 999, backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8 },
  filterOn: { backgroundColor: '#12261f' },
  filterText: { color: '#161513', fontWeight: '600' },
  filterTextOn: { color: '#f7f3ea' },
  search: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#161513',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  skeleton: { width: '48%', height: 210, borderRadius: 18, backgroundColor: '#e7e1d8', marginBottom: 14 },
  empty: { gap: 10, paddingVertical: 12 },
  button: { alignSelf: 'flex-start', backgroundColor: '#12261f', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: '#f7f3ea', fontWeight: '700' },
});
