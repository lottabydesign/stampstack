import { defineConfig } from 'tsup'

export default defineConfig({
  // Two entry points: the JS/TS library, and the standalone CSS theme.
  // esbuild emits dist/styles.css for the .css entry.
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // React must NOT be bundled — it's a peer dependency the consumer provides.
  external: ['react', 'react-dom'],
})
