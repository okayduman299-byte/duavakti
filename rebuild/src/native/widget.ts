import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export interface WidgetPayload {
  location: string;
  nextPrayer: string;
  nextTime: string;
  remaining: string;
  targetEpoch: number;
  prayers: Array<{ label: string; time: string }>;
}

interface DuaVaktiWidgetNativeModule {
  update(payload: WidgetPayload): Promise<boolean>;
}

export async function updateNativeWidgets(payload: WidgetPayload): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const module = requireNativeModule<DuaVaktiWidgetNativeModule>('DuaVaktiWidget');
    return await module.update(payload);
  } catch {
    // Expo Go has no custom DuaVakti native module. Keep the rest of the app usable.
    return false;
  }
}
