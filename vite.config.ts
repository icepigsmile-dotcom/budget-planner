import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base: repo name on GitHub Pages; override with VITE_BASE if the repo name differs
export default defineConfig({
  base: process.env.VITE_BASE ?? '/budget-planner/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Heo Đất Planner',
        short_name: 'Heo Đất',
        description: 'Quản lý ngân sách và kế hoạch mua sắm cá nhân',
        lang: 'vi',
        display: 'standalone',
        background_color: '#FDF4EE',
        theme_color: '#F29BB1',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // never cache Microsoft endpoints; app data caching is handled in localStorage
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [],
      },
    }),
  ],
})
