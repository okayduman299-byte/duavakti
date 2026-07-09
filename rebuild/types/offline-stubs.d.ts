declare namespace React {
  type ReactNode = any;
  type ErrorInfo = any;
  type ComponentType<P = any> = any;
  type FC<P = {}> = (props: P) => any;
  class Component<P = any, S = any> {
    props: Readonly<P>;
    state: Readonly<S>;
    constructor(props: P);
    setState(state: Partial<S> | ((prev: S) => Partial<S>)): void;
  }
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type ErrorInfo = React.ErrorInfo;
  export const Component: typeof React.Component;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: readonly unknown[]): T;
  const ReactDefault: any;
  export default ReactDefault;
}

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const ScrollView: any;
  export const Pressable: any;
  export const FlatList: any;
  export const TextInput: any;
  export const Switch: any;
  export const ActivityIndicator: any;
  export const Platform: { OS: string };
  export const StatusBar: any;
  export const NativeModules: Record<string, any>;
  export const StyleSheet: { create<T extends Record<string, any>>(styles: T): T };
}

declare module 'expo-location' {
  export const Accuracy: { Balanced: any };
  export function requestForegroundPermissionsAsync(): Promise<{ status: string }>;
  export function getCurrentPositionAsync(options?: any): Promise<{ coords: { latitude: number; longitude: number } }>;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
  };
  export default AsyncStorage;
}

declare module 'expo-modules-core' {
  export function requireNativeModule<T = any>(name: string): T;
}

declare module 'expo' {
  export function registerRootComponent(component: any): void;
}
