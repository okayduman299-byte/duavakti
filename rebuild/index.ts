import { registerRootComponent } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';

// Keep startup as small as possible. Notification initialization is deferred
// until the app is proven stable; a native notification crash must not prevent
// the main application from launching.
const ERROR_KEY = '@duavakti/startup-errors';

const recordStartupError = async (error: unknown) => {
  try {
    const message = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error);
    const previous = await AsyncStorage.getItem(ERROR_KEY);
    const entries = previous ? JSON.parse(previous) : [];
    const next = Array.isArray(entries) ? entries.slice(-4) : [];
    next.push({ at: new Date().toISOString(), message });
    await AsyncStorage.setItem(ERROR_KEY, JSON.stringify(next));
  } catch {
    // Diagnostics must never crash the application.
  }
};

const globalErrorHandler = (error: Error, isFatal?: boolean) => {
  void recordStartupError({
    name: error?.name ?? 'Error',
    message: `${isFatal ? '[FATAL] ' : ''}${error?.message ?? String(error)}`,
    stack: error?.stack,
  });
};

const errorUtils = (globalThis as typeof globalThis & {
  ErrorUtils?: { setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void };
}).ErrorUtils;
errorUtils?.setGlobalHandler?.(globalErrorHandler);

registerRootComponent(App);
