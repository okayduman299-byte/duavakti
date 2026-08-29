import { registerRootComponent } from 'expo';
import App from './App';

// Crash-safe bootstrap: keep native notification initialization out of startup.
registerRootComponent(App);
