import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const api = env.VITE_API_URL || 'http://localhost:8080';
  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/events': api,
        '/notifications': api
      }
    }
  };
});

