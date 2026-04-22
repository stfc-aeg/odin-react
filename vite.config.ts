/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
// import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';

// https://vite.dev/config/
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), libInjectCss(), dts(
    {
      rollupTypes: true,
      tsconfigPath: './tsconfig-build.json',
    }
  )],
  resolve: {
    tsconfigPaths: true
  },
  // assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  build: {
    copyPublicDir: false,
    minify: false,
    // manifest: true,
    emitAssets: true,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: "odin-react",
      fileName: "odin-react"
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', "bootstrap", "react-bootstrap", "plotly.js", "react-plotly.js", "react-bootstrap-icons", "axios"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-bootstrap": "react-bootstrap",
          "axios": "axios",
          "react-bootstrap-icons": "react-bootstrap-icons"
        }
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