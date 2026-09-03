import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { widgetTaskHandler } from './widget-task-handler';

// Crash-safe bootstrap: keep native notification initialization out of startup.
// Android home-screen widget support is registered alongside the app entry point.
registerRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);
