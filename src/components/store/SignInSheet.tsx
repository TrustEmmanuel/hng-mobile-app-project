import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export function SignInSheet() {
  const { signInOpen, closeSignIn, startGoogleSignIn, authError } = useAuth();

  return (
    <Modal visible={signInOpen} transparent animationType="fade" onRequestClose={closeSignIn}>
      <Pressable style={styles.backdrop} onPress={closeSignIn}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <View style={styles.head}>
            <Text style={styles.title}>Sign in to TajMart</Text>
            <Pressable onPress={closeSignIn} accessibilityLabel="Close">
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.copy}>
            Google confirms who the order belongs to. We store your name, email, and Google ID, then send the receipt
            to that inbox.
          </Text>
          <Pressable style={styles.button} onPress={startGoogleSignIn}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </Pressable>
          {authError ? <Text style={styles.error}>{authError}</Text> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 21, 19, 0.45)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    gap: 14,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#161513',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  close: {
    color: '#5c564e',
    fontWeight: '600',
  },
  copy: {
    color: '#5c564e',
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#12261f',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f7f3ea',
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: '#9a3412',
    fontSize: 14,
    lineHeight: 20,
  },
});
