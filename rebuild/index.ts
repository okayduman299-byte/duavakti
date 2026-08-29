import { registerRootComponent } from 'expo';
import App from './App';

// Crash-safe bootstrap: keep native notification initialization out of startup.
// Diagnostic build marker: 1.7.3-stable-bootstrap
registerRootComponent(App);
