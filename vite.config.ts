import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { apiRouter, handleOAuthCallback } from './src/server/api.ts';

function apiDevPlugin(): Plugin {
  return {
    name: 'opspilot-api-middleware',
    configureServer(server) {
      const app = express();
      app.use(express.json());
      app.use('/api', apiRouter);
      app.get(['/auth/callback', '/auth/callback/', '/auth/github/callback', '/auth/github/callback/'], handleOAuthCallback);
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
