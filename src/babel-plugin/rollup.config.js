import {join as joinPath} from 'path'
import typescript from '@rollup/plugin-typescript'
import packageJson from '../../package.json'

const babelPlugin = {
	input: joinPath(__dirname, 'index.ts'),
	output: {
		format: 'esm',
		file: 'babel-plugin-proxyfill.mjs',
	},
	external: Object.keys(packageJson.dependencies),
	plugins: [
		typescript({
			module: 'es2020',
			sourceMap: false,
		}),
	],
}

export default babelPlugin
