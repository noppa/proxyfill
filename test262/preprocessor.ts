import {parse} from '@babel/parser'
import generate from '@babel/generator'
import babelTraverse from '@babel/traverse'
import proxyfill from '../src/index'
import {VisitorState} from '../src/babel-plugin/types'
import {join as joinPath} from 'path'
import {readFileSync} from 'fs'

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
		// Note: test262-harness has its own prelude-option, but it's added
		// before this so we'd end up compiling runtime code, too.
		const prelude = readFileSync(
			joinPath(__dirname, '../dist/runtime-global.js'),
			'utf8'
		)
		const traverse = proxyfill()
		const ast = parse(test.contents, {
			sourceType: 'module',
			plugins: [],
		})

		babelTraverse<VisitorState>(ast, traverse.visitor, undefined, {
			opts: {
				importStyle: 'none',
				ignoredProperties: [
					{
						objectIdentifierName: 'assert',
						propertyIdentifierName: '*',
					},
				],
			},
		})
		test.contents = prelude + ';\n' + generate(ast).code
		// console.log(test.contents)
	} catch (error) {
		test.result = {
			stderr: `${error.name}: ${error.message}\n`,
			stdout: '',
			error,
		}
	}

	return test
}
