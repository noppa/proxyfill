import MemberExpression from './memberExpression'
import AssignmentExpression from './assignmentExpression'
import CallExpression from './callExpression'
import BinaryExpression from './binaryExpression'

import type * as Babel from '@babel/core'
import template from '@babel/template'
import {VisitorState} from './types'
import {namespaceName, toNamedImport} from './constants'
import {RuntimeFunctions} from '../runtime'
import invalidValue from '../utils/invalidValue'
import {ImportDeclaration, VariableDeclaration} from '@babel/types'

const runtimeFunctionsMap: {[k in keyof RuntimeFunctions]: 0} = {
	get: 0,
	set: 0,
	invoke: 0,
	has: 0,
}

const runtimeApiFunctionNames = Object.keys(runtimeFunctionsMap)

// TODO: Right now, Proxy is always imported, but we should make it
// configurable whether it's imported this way or assigned to global etc.
// Also should rename all local variable/function declarations named "Proxy"
// so they don't conflict.

const namedImportsTemplate =
	`Proxy = ${namespaceName}.Proxy, ` +
	runtimeApiFunctionNames
		.map(
			(exportedName) =>
				`${toNamedImport(exportedName)} = ${namespaceName}.${exportedName}`
		)
		.join(', ') +
	';'

const importTemplate = template(`
  import * as ${namespaceName} from 'proxyfill/runtime.mjs';
	var ${namedImportsTemplate}
`)

const requireTemplate = template(
	`var ${namespaceName} = require('proxyfill/runtime.js'), ` +
		namedImportsTemplate
)

export default function babelPluginProxyfill(): Babel.PluginObj<VisitorState> {
	return {
		name: 'proxyfill',
		visitor: {
			Program(path, {opts}: VisitorState) {
				const {importStyle = 'esmodule'} = opts
				let importRuntime: ImportDeclaration | VariableDeclaration
				switch (importStyle) {
					case 'esmodule':
						importRuntime = importTemplate() as any
						break
					case 'commonjs':
						importRuntime = requireTemplate() as any
						break
					case 'none':
						return // No need to add imports at all
					default:
						importRuntime = invalidValue(
							'importStyle',
							'"esmodule", "commonjs" or "none"',
							importStyle
						)
				}
				path.unshiftContainer('body', importRuntime)
			},
			MemberExpression,
			CallExpression,
			AssignmentExpression,
			BinaryExpression,
		},
	}
}
