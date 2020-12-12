// This file is for quick & dirty
// interactive development of the plugin.
import {parse} from '@babel/parser'
import generate from '@babel/generator'
import babelTraverse from '@babel/traverse'

import proxyfill from '../../src/index'
import {VisitorState} from '../../src/babel-plugin/types'

const traverse = proxyfill()

const code = `
  function test(a) {
    foo.bar = obj.a(a.c)
	}
`

const ast = parse(code, {
	sourceType: 'module',
	plugins: [],
})

setTimeout(() => {
	babelTraverse<VisitorState>(ast, traverse.visitor, undefined, {})
	const newCode = generate(ast)
	console.log(newCode.code)
}, 500)
