/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * The most GitHub Pages allows: a CSP meta tag. Headers (HSTS, frame-ancestors, X-Frame-Options)
 * need a CDN in front. Build only, because the Vite dev server injects an inline script.
 */
export function contentSecurityPolicy(supabaseUrl?: string): string {
  const custom = supabaseUrl && !/\.supabase\.co\/?$/.test(supabaseUrl) ? ` ${new URL(supabaseUrl).origin}` : '';
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co${custom}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'borderday-security-meta',
      apply: 'build',
      // After the charset, which browsers need within the first 1024 bytes, and before any script.
      transformIndexHtml: (html) =>
        html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(process.env.VITE_SUPABASE_URL)}" />`,
        ),
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'og.png', 'icons/*.png'],
      manifest: {
        name: 'BorderDay',
        short_name: 'BorderDay',
        description: 'Track cross-border workdays against official tax and social-security limits.',
        theme_color: '#0B3D91',
        background_color: '#E8F1FC',
        display: 'standalone',
        start_url: '/en/app',
        lang: 'en',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt,xml}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
