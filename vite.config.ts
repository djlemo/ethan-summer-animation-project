// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { // Vitest configuration
    globals: true,
    environment: 'jsdom', // For browser-like environment, including File, FileReader
    // setupFiles: './src/setupTests.ts', // Optional: if you have a test setup file
  },
});