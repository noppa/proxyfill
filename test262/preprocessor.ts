import {parse} from '@babel/parser'
import generate from '@babel/generator'
import babelTraverse from '@babel/traverse'
import {format} from 'prettier'
import prettierrc from '../.prettierrc.js'
import proxyfill from '../src/index'
import {VisitorState} from '../src/babel-plugin/types'

type ResultObject = {
	contents: string
	result?: {
		stderr: string
		stdout: string
		error: Error
	}
}

export default function preprocessProxyfill(test: ResultObject) {
	try {
		console.log(test.contents)
		const traverse = proxyfill()
		const ast = parse(test.contents, {
			sourceType: 'module',
			plugins: [],
		})

		babelTraverse<VisitorState>(ast, traverse.visitor, undefined, {})
		test.contents = generate(ast).code
	} catch (error) {
		test.result = {
			stderr: `${error.name}: ${error.message}\n`,
			stdout: '',
			error,
		}
	}

	return test
}
