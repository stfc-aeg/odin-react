/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import react from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';

// https://vite.dev/config/
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(),
  // externalizeDeps(),
  libInjectCss(), dts({
    tsconfigPath: './tsconfig-build.json',
    bundleTypes: true
  }), libAssetsPlugin()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  build: {
    copyPublicDir: false,
    minify: false,
    manifest: true,
    emitAssets: true,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', "bootstrap", "react-bootstrap", "plotly.js", "react-plotly.js", "react-bootstrap-icons", "lodash", "axios"],
      input: Object.fromEntries(
      // https://rollupjs.org/configuration-options/#input
      glob.sync('lib/**/*.{ts,tsx}', {
        ignore: ["lib/**/*.d.ts", "lib/**/*.types.ts"]
      }).map(file => [
      // 1. The name of the entry point
      // lib/nested/foo.js becomes nested/foo
      relative('lib', file.slice(0, file.length - extname(file).length)),
      // 2. The absolute path to the entry file
      // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
      fileURLToPath(new URL(file, import.meta.url))])),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});