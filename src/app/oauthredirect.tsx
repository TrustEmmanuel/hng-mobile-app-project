import { useEffect } from 'react';
import { View } from 'react-native';

import { replace } from '@/lib/nav';

export default function OAuthRedirectScreen() {
  useEffect(() => {
    replace('/');
  }, []);

  return <View style={{ flex: 1, backgroundColor: '#f3f1ec' }} />;
}
