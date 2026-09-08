import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

const debugLoggerPlugin = (): Plugin => ({
  name: 'debug-logger',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith('/api/client-log')) {
        const url = new URL(req.url, 'http://localhost:3000');
        const msg = url.searchParams.get('msg') || '';
        const logLine = `[${new Date().toISOString()}] ${msg}\n`;
        try {
          fs.appendFileSync('/tmp/client_debug.log', logLine);
        } catch {}
        console.log('[CLIENT DEBUG]', msg);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('ok');
        return;
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      debugLoggerPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
