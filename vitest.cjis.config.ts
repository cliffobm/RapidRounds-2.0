import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  test: { environment: 'jsdom', include: ['cjis/integration.spec.ts'], maxWorkers: 2, minWorkers: 1 },
  resolve: { alias: { '@': path.resolve(__dirname, './') } },
});
