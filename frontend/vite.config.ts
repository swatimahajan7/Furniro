import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:8100';
  // The dev server and `vite preview` (the production build) both forward the API and media.
  const proxy = {
    '/api': { target: apiTarget, changeOrigin: true },
    '/media': { target: apiTarget, changeOrigin: true },
  };

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: Number(env.WEB_PORT ?? 5180),
      strictPort: true,
      proxy,
    },
    preview: { port: 4180, strictPort: true, proxy },
  };
});
