import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AppHeader } from '@/components/store/AppHeader';
import { SignInSheet } from '@/components/store/SignInSheet';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { CatalogProvider } from '@/context/CatalogContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <CatalogProvider>
        <CartProvider>
          <View style={{ flex: 1, backgroundColor: '#f3f1ec' }}>
            <AppHeader />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#f3f1ec' },
              }}
            />
            <SignInSheet />
          </View>
        </CartProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
