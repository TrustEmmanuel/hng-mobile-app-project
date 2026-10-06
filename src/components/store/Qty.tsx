import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Qty({
  value,
  onChange,
  min = 1,
  max = 12,
}: {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={styles.qty}>
      <Pressable
        style={styles.step}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityLabel="Decrease quantity">
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={styles.step}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityLabel="Increase quantity">
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#f3f1ec',
    overflow: 'hidden',
  },
  step: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 18,
    color: '#12261f',
  },
  value: {
    minWidth: 22,
    textAlign: 'center',
    fontWeight: '700',
    color: '#161513',
  },
});
