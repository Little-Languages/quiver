import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      name: 'perfect-arrow',
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'perfect-arrow',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@lit/reactive-element',
        '@lit/reactive-element/decorators.js',
        'perfect-arrows',
        'viz-observer',
      ],
    },
  },
});
