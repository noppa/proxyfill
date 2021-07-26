import MemberExpression from './memberExpression'
import AssignmentExpression from './assignmentExpression'
import CallExpression from './callExpression'
import BinaryExpression from './binaryExpression'
import UnaryExpression from './unaryExpression'
import UpdateExpression from './updateExpression'

import type * as Babel from '@babel/core'
import template from '@babel/template'
import {VisitorState} from './types'
import {namespaceName, toNamedImport} from './constants'
import {RuntimeFunctions} from '../runtime'
import {ImportDeclaration, VariableDeclaration} from '@babel/types'

const runtimeFunctionsMap: {[k in keyof RuntimeFunctions]: 0} = {
	get: 0,
	set: 0,
	invoke: 0,
	has: 0,
	deleteProperty: 0,
	updateProperty: 0,
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

const ownImportPath = /proxyfill[\\/]runtime/

export default function babelPluginProxyfill(): Babel.PluginObj<VisitorState> {
	return {
		name: 'proxyfill',
		visitor: {
			Program(path, {opts}: VisitorState) {
				const {node} = path
				const {sourceFile, sourceType} = node
				if (sourceFile && ownImportPath.test(sourceFile)) {
					path.stop()
					return
				}
				if (opts.skipImports) {
					return
				}
				const importRuntime: ImportDeclaration | VariableDeclaration =
					sourceType === 'module'
						? (importTemplate() as any)
						: (requireTemplate() as any)
				path.unshiftContainer('body', importRuntime)
			},
			MemberExpression,
			CallExpression,
			AssignmentExpression,
			BinaryExpression,
			UnaryExpression,
			UpdateExpression,
		},
	}
}
