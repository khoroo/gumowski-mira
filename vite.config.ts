import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/gumowski-mira/', // Add this line to specify the subdirectory path
  server: {
    port: 3000,
  },
});