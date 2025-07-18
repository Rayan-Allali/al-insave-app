import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInitial = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(!!state.isConnected);
    };
    checkInitial();
    const subscription = Network.addNetworkStateListener((state) => {
      setIsConnected(!!state.isConnected);

      if (state.isConnected) {
        console.log('✅ Internet connected');
      } else {
        console.log('🚫 Internet lost');
        Alert.alert('No Internet', 'Please check your internet connection.');
      }
    });

    return () => {
      subscription && subscription.remove(); // Clean up listener
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        {isConnected === null
          ? 'Checking network...'
          : isConnected
          ? '🟢 Connected to Internet'
          : '🔴 No Internet Connection'}
      </Text>
    </View>
  );
}