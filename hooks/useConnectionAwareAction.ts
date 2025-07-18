import * as Network from 'expo-network';
import { useCallback } from 'react';

export function useConnectionAwareAction() {
  const runAction = useCallback(async (actionWhenOnline: () => Promise<void>, actionWhenOffline: () => Promise<void>) => {
    const state = await Network.getNetworkStateAsync();
    if (state.isConnected) {
      await actionWhenOnline();
    } else {
      await actionWhenOffline();
    }
  }, []);

  return { runAction };
}