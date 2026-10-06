import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import { categories } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { back, go } from '@/lib/nav';

const shortLabel: Record<string, string> = {
  staples: 'Staples',
  drinks: 'Drinks',
  bakery: 'Bakery',
  household: 'Household',
};

function hoursLabel(date = new Date()) {
  return date.getDay() === 0 ? 'Open today · 10:00–16:00' : 'Open today · 08:00–20:00';
}

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { count } = useCart();
  const { user, openSignIn, signOut } = useAuth();
  const [query, setQuery] = useState('');

  function onSearch() {
    const term = query.trim();
    go(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  }

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: '#ffffff' }}>
      <View style={styles.announce}>
        <Text style={styles.announceText}>Same-day Lagos delivery before 4pm</Text>
        <Text style={styles.announceText}>{hoursLabel()}</Text>
      </View>
      <View style={styles.bar}>
        <Pressable onPress={() => go('/')} hitSlop={8}>
          <Text style={styles.brand}>TajMart</Text>
        </Pressable>
        <Pressable onPress={back} hitSlop={8}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
        <View style={styles.spacer} />
        {user ? (
          <Pressable onPress={signOut}>
            <Text style={styles.link}>{user.name.split(' ')[0]}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={openSignIn}>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        )}
        <Pressable style={styles.basket} onPress={() => go('/cart')}>
          <Text style={styles.basketText}>Basket</Text>
          {count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
          placeholder="Search the shelf"
          placeholderTextColor="#8a837a"
          style={styles.search}
          returnKeyType="search"
        />
      </View>
      <View style={styles.links}>
        <Pressable onPress={() => go('/shop')}>
          <Text style={styles.chip}>Shop</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable key={category.slug} onPress={() => go(`/shop?category=${category.slug}`)}>
            <Text style={styles.chip}>{shortLabel[category.slug]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  announce: {
    backgroundColor: '#12261f',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 2,
  },
  announceText: {
    color: '#f7f3ea',
    fontSize: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  brand: {
    color: '#12261f',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  spacer: {
    flex: 1,
  },
  link: {
    color: '#161513',
    fontSize: 14,
    fontWeight: '600',
  },
  basket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  basketText: {
    color: '#12261f',
    fontWeight: '700',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#c2410c',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  search: {
    backgroundColor: '#f3f1ec',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#161513',
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    backgroundColor: '#f7f3ea',
    color: '#12261f',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '600',
  },
});
