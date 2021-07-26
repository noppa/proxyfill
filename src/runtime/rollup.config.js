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
				target: 'es5',
				sourceMap: false,
			}),
		],
	}
}

export const runtimeIife = config({format: 'iife', file: 'runtime-global.js'})
const runtimeCjs = config({format: 'cjs', file: 'runtime.js'})
const runtimeEsm = config({format: 'esm', file: 'runtime.mjs'})

export default [runtimeIife, runtimeCjs, runtimeEsm]
