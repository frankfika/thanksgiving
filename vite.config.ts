import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Use process.env for Vercel, fallback to loadEnv for local
    const deepseekKey = process.env.DEEPSEEK_KEY || env.DEEPSEEK_KEY;
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.DEEPSEEK_KEY': JSON.stringify(deepseekKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
