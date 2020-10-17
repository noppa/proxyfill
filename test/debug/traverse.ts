// This file is for quick & dirty
// interactive development of the plugin.
type A = number
console.log('enter')

import { parse } from '@babel/parser'
import generate from '@babel/generator'
import babelTraverse from '@babel/traverse'

import proxyfill from '../../src/index'

const traverse = proxyfill()

const code = `
  function test(a) {
    return a.b
  }
`

const ast = parse(code, {
	sourceType: 'module',
	plugins: [],
})

setTimeout(() => {
	babelTraverse(ast, traverse.visitor)
	const newCode = generate(ast)
	console.log(newCode)
}, 500)
