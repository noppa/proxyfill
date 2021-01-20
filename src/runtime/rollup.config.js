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


export const iife = config({format: 'iife', file: 'dist/runtime-global.js'})
export const cjs = config({format: 'cjs', file: 'dist/runtime.js'})
export const esm = config({format: 'esm', file: 'dist/runtime.mjs'})

export default [
  iife, cjs, esm,
]
