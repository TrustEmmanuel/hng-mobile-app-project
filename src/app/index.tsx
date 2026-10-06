import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductCard, type ShelfProduct } from '@/components/store/ProductCard';
import { ProductVisual } from '@/components/store/ProductVisual';
import { useCatalog } from '@/context/CatalogContext';
import { categories, pickFeatured } from '@/data/products';
import { formatNaira } from '@/lib/money';
import { go } from '@/lib/nav';

const aisleLabel: Record<string, string> = {
  staples: 'Staples',
  drinks: 'Drinks',
  bakery: 'Bakery',
  household: 'Household',
};

const aisleTint: Record<string, string> = {
  staples: '#f7eddc',
  drinks: '#e7f1f6',
  bakery: '#f8f1e2',
  household: '#e7f6ef',
};

export default function HomeScreen() {
  const { products, loading } = useCatalog();
  const featured = pickFeatured(products) as ShelfProduct[];
  const heroProduct =
    (products.find((product) => product.name === 'Agege Bread') as ShelfProduct | undefined) || featured[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Yaba · order before 4pm</Text>
        <Text style={styles.title}>Groceries for the way Lagos cooks.</Text>
        <Text style={styles.lede}>
          Garri, palm oil, Maggi, and Agege bread on the same run as Coke and Peak. Same-day across Lagos. Pay when the
          bag arrives.
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={() => go('/shop')}>
            <Text style={styles.buttonText}>Shop the shelf</Text>
          </Pressable>
          <Pressable style={styles.lineButton} onPress={() => go('/shop?category=staples')}>
            <Text style={styles.lineButtonText}>Nigerian staples</Text>
          </Pressable>
        </View>
        {loading || !heroProduct ? (
          <View style={styles.heroSkeleton} />
        ) : (
          <Pressable style={styles.heroCard} onPress={() => go(`/product/${heroProduct.id}`)}>
            <ProductVisual product={heroProduct} />
            <View style={styles.heroCaption}>
              <Text style={styles.heroName}>{heroProduct.name}</Text>
              <Text style={styles.heroPrice}>{formatNaira(heroProduct.price)}</Text>
            </View>
          </Pressable>
        )}
      </View>

      <View style={styles.aisles}>
        {categories.map((category) => (
          <Pressable
            key={category.slug}
            style={[styles.aisle, { backgroundColor: aisleTint[category.slug] }]}
            onPress={() => go(`/shop?category=${category.slug}`)}>
            <Text style={styles.aisleTitle}>{aisleLabel[category.slug]}</Text>
            <Text style={styles.aisleBlurb}>{category.blurb}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>On the shelf</Text>
        <Pressable onPress={() => go('/shop')}>
          <Text style={styles.textLink}>View the full shelf</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {loading
          ? Array.from({ length: 4 }, (_, index) => <View key={index} style={styles.skeleton} />)
          : featured.map((product) => <ProductCard key={product.id} product={product} />)}
      </View>

      <View style={styles.steps}>
        <View style={styles.step}>
          <Text style={styles.stepNo}>01</Text>
          <Text style={styles.stepTitle}>Build a basket</Text>
          <Text style={styles.stepCopy}>Add what the kitchen is short on. Sign in and the same basket is there on the next device.</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNo}>02</Text>
          <Text style={styles.stepTitle}>Sign in with Google</Text>
          <Text style={styles.stepCopy}>Browsing is open. Google is how the basket stays attached to you, and how the receipt finds you.</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNo}>03</Text>
          <Text style={styles.stepTitle}>We cross Lagos</Text>
          <Text style={styles.stepCopy}>Leave a phone number and address. Pay by transfer or cash when the bag arrives.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.brand}>TajMart</Text>
        <Text style={styles.footerCopy}>A neighborhood grocery for Nigerian kitchens. 14 Market Lane, Yaba, Lagos.</Text>
        <Text style={styles.footerCopy}>Mon–Sat 8:00–20:00 · Sun 10:00–16:00</Text>
        <Text style={styles.footerCopy}>hello@tajmart.ng · Pay by transfer or cash on delivery.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f1ec',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 22,
  },
  hero: {
    gap: 12,
  },
  eyebrow: {
    color: '#9a3412',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#161513',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1,
  },
  lede: {
    color: '#5c564e',
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    backgroundColor: '#12261f',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#f7f3ea',
    fontWeight: '700',
  },
  lineButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#12261f',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  lineButtonText: {
    color: '#12261f',
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    gap: 10,
  },
  heroSkeleton: {
    height: 220,
    borderRadius: 20,
    backgroundColor: '#e7e1d8',
  },
  heroCaption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroName: {
    color: '#161513',
    fontWeight: '700',
    fontSize: 16,
  },
  heroPrice: {
    color: '#12261f',
    fontWeight: '700',
  },
  aisles: {
    gap: 10,
  },
  aisle: {
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  aisleTitle: {
    color: '#12261f',
    fontSize: 18,
    fontWeight: '700',
  },
  aisleBlurb: {
    color: '#5c564e',
    lineHeight: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: '#161513',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  textLink: {
    color: '#12261f',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeleton: {
    width: '48%',
    height: 210,
    borderRadius: 18,
    backgroundColor: '#e7e1d8',
    marginBottom: 14,
  },
  steps: {
    gap: 12,
  },
  step: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  stepNo: {
    color: '#9a3412',
    fontWeight: '700',
  },
  stepTitle: {
    color: '#161513',
    fontSize: 18,
    fontWeight: '700',
  },
  stepCopy: {
    color: '#5c564e',
    lineHeight: 21,
  },
  footer: {
    gap: 6,
    paddingTop: 8,
  },
  brand: {
    color: '#12261f',
    fontSize: 22,
    fontWeight: '700',
  },
  footerCopy: {
    color: '#5c564e',
    lineHeight: 20,
  },
});
