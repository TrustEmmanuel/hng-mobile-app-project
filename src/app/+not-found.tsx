import { Pressable, StyleSheet, Text, View } from 'react-native';

import { go } from '@/lib/nav';

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>That page isn’t on the shelf.</Text>
      <Pressable style={styles.button} onPress={() => go('/')}>
        <Text style={styles.buttonText}>Back home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f1ec', padding: 16, gap: 16 },
  title: { color: '#161513', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  button: { alignSelf: 'flex-start', backgroundColor: '#12261f', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: '#f7f3ea', fontWeight: '700' },
});
