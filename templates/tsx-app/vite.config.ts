import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This is what makes it "Expo-lite"
      'react-native': 'react-native-web',
    },
  },
});