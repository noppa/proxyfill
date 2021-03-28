import {parse} from '@babel/parser'
import generate from '@babel/generator'
import babelTraverse from '@babel/traverse'
import {format} from 'prettier'
import prettierrc from '../.prettierrc.js'
import proxyfill from '../src/index'
import {VisitorState} from '../src/babel-plugin/types'

export default function traverse(code: string): string {
	const traverse = proxyfill()
	const ast = parse(code, {
		sourceType: 'module',
		plugins: [],
	})

	babelTraverse<VisitorState>(ast, traverse.visitor, undefined, {opts: {}})
	const newCode = generate(ast)
	return format(newCode.code, {...(prettierrc as any), parser: 'babel'})
}
