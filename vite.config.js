import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Dev-only passthrough so the browser never needs the Resend key
        // directly: /api/resend/emails -> https://api.resend.com/emails
        // The Authorization header is injected here (this file runs in
        // Node, not the browser) using the plain RESEND_API_KEY env var
        // (no VITE_ prefix — it must NOT ship in the client bundle).
        // In production this same path is handled by api/resend/emails.js
        // as a Vercel serverless function instead.
        '/api/resend': {
          target: 'https://api.resend.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/resend/, ''),
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
        },
      },
    },
  }
})
