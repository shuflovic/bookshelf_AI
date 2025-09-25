/*import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    // HMR settings for Replit
    hmr: {
      clientPort: 443,
    },
    // Fix for "Blocked host" error on Replit
    allowedHosts: ['.replit.dev'],
  },
}); */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/bookshelf_AI/',
});
