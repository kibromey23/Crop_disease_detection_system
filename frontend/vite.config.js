import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',       // broader browser support
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Granular code splitting — each chunk loads independently
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/'))
              return 'vendor-react';
            return 'vendor';
          }
          // Split heavy pages into their own chunks
          const heavyPages = [
            'EncyclopediaPage','AnalyticsPage','CommunityPage',
            'BookmarksPage','PricingPage','SettingsPage',
          ];
          for (const page of heavyPages) {
            if (id.includes(page)) return `page-${page.toLowerCase()}`;
          }
        },
        // Stable file names for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    }
  },

  esbuild: {
    sourcemap: mode === 'development' ? 'inline' : false,
    // Strip console.log in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: http://localhost:3001",
        "connect-src 'self' http://localhost:3001 http://localhost:8000 https://api.open-meteo.com https://api.anthropic.com",
        "worker-src 'self' blob:",
      ].join('; ')
    },
    proxy: {
      '/api':     { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    }
  }
}))
