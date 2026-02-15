import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('App', () => App);

// Run it on the web
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});