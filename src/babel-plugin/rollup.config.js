import {join as joinPath} from 'path'
import typescript from '@rollup/plugin-typescript'
import packageJson from '../../package.json'

const babelPlugin = {
	input: joinPath(__dirname, 'index.ts'),
	output: {
		format: 'cjs',
		exports: 'default',
		file: 'babel-plugin-proxyfill.js',
	},
	external: Object.keys(packageJson.dependencies),
	plugins: [
		typescript({
			module: 'es2020',
			target: 'es2019',
			sourceMap: false,
		}),
	],
}

export default babelPlugin
