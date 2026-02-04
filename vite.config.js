import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tulsaVsAustin: resolve(__dirname, 'src/stories/tulsa-vs/austin/index.html'),
      },
    },
  },
  // Allow JSON imports
  json: {
    stringify: false,
  },
});
