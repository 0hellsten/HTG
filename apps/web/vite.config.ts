import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'HTG — Hellstens Trav och Galopp',
        short_name: 'HTG',
        description: 'Hellstens Trav och Galopp — En lugn travapp med dagens omgång, startlistor och tips.',
        theme_color: '#1e293b',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/halsa': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/halsa': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
    },
  },
});
