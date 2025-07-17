import { defineConfig } from 'vite'
import { extname, relative, resolve } from 'path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'
import react from '@vitejs/plugin-react'
import dts from 'unplugin-dts/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // externalizeDeps(),
    libInjectCss(),
    dts({ tsconfigPath: './tsconfig-build.json', bundleTypes: true }),
    libAssetsPlugin()
    
  ],
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
      external: ['react', 'react/jsx-runtime', "bootstrap", "react-bootstrap", 
                 "plotly.js", "react-plotly.js", "react-bootstrap-icons", "lodash", "axios",
                "lib/**/*stories*.tsx"],
      input: Object.fromEntries(
        // https://rollupjs.org/configuration-options/#input
        glob.sync('lib/**/*.{ts,tsx}', {
          ignore: ["lib/**/*.d.ts", "lib/**/*.types.ts", "lib/**/*stories*"],
        }).map(file => [
          // 1. The name of the entry point
          // lib/nested/foo.js becomes nested/foo
          relative(
            'lib',
            file.slice(0, file.length - extname(file).length)
          ),
          // 2. The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      }
    }
  }
})
