import {join as joinPath} from 'path' 
import typescript from '@rollup/plugin-typescript'

function config(output) {
  const main = output.format === 'iife' ? 'global.ts' : 'index.ts'
  return {
    input: joinPath(__dirname, main),
    output,
    plugins: [
      typescript({
        module: 'es2020',
        sourceMap: false,
      }),
    ],
  }
}

export default [
  config({format: 'iife', file: 'dist/global.js'}),
  config({format: 'cjs', file: 'dist/index.js'}),
  config({format: 'esm', file: 'dist/index.mjs'}),
]
