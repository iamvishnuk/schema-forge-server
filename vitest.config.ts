/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'src/__tests__/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '**/*.d.ts',
      'src/__tests__/setup.ts',
      'src/__tests__/helpers/**',
      'src/__tests__/test.config.ts'
    ],
    setupFiles: ['./src/__tests__/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules',
        'dist/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    testTimeout: 30000, // Reduced from 120000ms
    hookTimeout: 20000, // Reduced from 60000ms
    retry: 1, // Reduced from 2 to avoid masking real issues

    // Sequential execution to avoid race conditions
    sequence: {
      concurrent: false,
      shuffle: false // Disable test shuffling for consistent results
    },

    // Pool options for better performance and isolation
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true, // Better isolation between tests
        minThreads: 1,
        maxThreads: 1
      }
    },

    // Better isolation and cleanup
    isolate: true,
    clearMocks: true,
    restoreMocks: true
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@core': path.resolve(__dirname, './src/core'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@interfaces': path.resolve(__dirname, './src/interfaces')
    }
  },

  define: {
    'process.env.NODE_ENV': '"test"'
  }
});
