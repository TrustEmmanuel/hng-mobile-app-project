import { Image, StyleSheet, Text, View } from 'react-native';

import { artForProduct } from '@/data/products';

const photos = {
  agege: require('@/assets/products/agege.jpg'),
  beans: require('@/assets/products/beans.jpg'),
  butterbread: require('@/assets/products/butterbread.jpg'),
  chinchin: require('@/assets/products/chinchin.jpg'),
  coke: require('@/assets/products/coke.jpg'),
  dettol: require('@/assets/products/dettol.jpg'),
  fanta: require('@/assets/products/fanta.jpg'),
  fivealive: require('@/assets/products/fivealive.jpg'),
  garri: require('@/assets/products/garri.jpg'),
  groundnut: require('@/assets/products/groundnut.jpg'),
  hollandia: require('@/assets/products/hollandia.jpg'),
  indomie: require('@/assets/products/indomie.jpg'),
  maggi: require('@/assets/products/maggi.jpg'),
  meatpie: require('@/assets/products/meatpie.jpg'),
  milo: require('@/assets/products/milo.jpg'),
  morningfresh: require('@/assets/products/morningfresh.jpg'),
  palm: require('@/assets/products/palm.jpg'),
  peak: require('@/assets/products/peak.jpg'),
  rice: require('@/assets/products/rice.jpg'),
  semovita: require('@/assets/products/semovita.jpg'),
  sprite: require('@/assets/products/sprite.jpg'),
  sugar: require('@/assets/products/sugar.jpg'),
  tissue: require('@/assets/products/tissue.jpg'),
  tomato: require('@/assets/products/tomato.jpg'),
  water: require('@/assets/products/water.jpg'),
} as const;

const contain = new Set(['coke', 'fanta', 'sprite', 'water', 'groundnut']);

type VisualProduct = {
  name: string;
  image_url?: string | null;
};

function slugFrom(src: string) {
  return src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') || '';
}

function photoFor(src: string) {
  if (src.startsWith('http')) return { uri: src };
  const slug = slugFrom(src);
  if (slug in photos) return photos[slug as keyof typeof photos];
  return null;
}

export function ProductVisual({ product }: { product: VisualProduct }) {
  const src = product.image_url || '';
  const photo = src.startsWith('/') || src.startsWith('http') ? photoFor(src) : null;
  const slug = slugFrom(src);

  if (photo) {
    return (
      <View style={styles.frame}>
        <Image source={photo} style={styles.image} resizeMode={contain.has(slug) ? 'contain' : 'cover'} />
      </View>
    );
  }

  const art = artForProduct(product);
  return (
    <View style={[styles.frame, { backgroundColor: art.swatch }]}>
      <View style={[styles.pack, { backgroundColor: art.body }]}>
        <View style={[styles.cap, { backgroundColor: art.cap }]} />
        <Text style={[styles.label, { color: art.ink }]}>{art.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f7f3ea',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pack: {
    width: '62%',
    height: '72%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  cap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
