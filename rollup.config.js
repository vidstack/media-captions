import { transformSync } from 'esbuild';
import { defineConfig } from 'rollup';
import esbuildPlugin from 'rollup-plugin-esbuild';

export default defineConfig([
  // dev
  define({ dev: true }),
  // prod
  define({ dev: false }),
]);

/** @returns {import('rollup').RollupOptions} */
function define({ dev = false }) {
  const alias = dev ? 'dev' : 'prod',
    shouldMangle = !dev;

  /** @type {Record<string, string | false>} */
  let mangleCache = {};

  return {
    input: {
      [alias]: 'src/index.ts',
    },
    treeshake: true,
    maxParallelFileOps: shouldMangle ? 1 : 20,
    output: {
      format: 'esm',
      dir: 'dist',
      chunkFileNames: `${alias}/[name].js`,
    },
    plugins: [
      esbuildPlugin({
        target: 'esnext',
        platform: 'neutral',
        tsconfig: 'tsconfig.build.json',
        minify: false,
        define: {
          __DEV__: dev ? 'true' : 'false',
        },
      }),
      shouldMangle && {
        name: 'mangle',
        transform(code) {
          const result = transformSync(code, {
            target: 'esnext',
            minify: false,
            mangleProps: /^_/,
            mangleCache,
            loader: 'ts',
          });

          mangleCache = {
            ...mangleCache,
            ...result.mangleCache,
          };

          return result.code;
        },
      },
    ],
  };
}
