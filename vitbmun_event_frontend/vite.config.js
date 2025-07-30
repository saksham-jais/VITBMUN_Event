import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.warn(`⚠ Proxy error (backend down): ${err.message}`);
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify({ error: 'Backend not reachable' }));
          });
        }
      },
      '/ws': {
        target: 'ws://localhost:4000', // ✅ WebSocket server
        ws: true,                     // ✅ Enable WebSocket proxy
        changeOrigin: true
      }
    }
  }
});
