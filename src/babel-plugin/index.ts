import MemberExpression from './memberExpression'
import AssignmentExpression from './assignmentExpression'
import CallExpression from './callExpression'

import type * as Babel from '@babel/core'
import template from '@babel/template'
import {ProxyfillBabelPluginOptions, VisitorState} from './types'
import {toNamedImport} from './constants'
import {RuntimeFunctions} from '../runtime'
import invalidValue from '../utils/invalidValue'
import {ImportDeclaration, VariableDeclaration} from '@babel/types'

const runtimeFunctionsMap: {[k in keyof RuntimeFunctions]: 0} = {
	get: 0,
	set: 0,
	invoke: 0,
}

const runtimeApiFunctionNames = ['Proxy', ...Object.keys(runtimeFunctionsMap)]

const importTemplate = template(`
  import {
		${runtimeApiFunctionNames
			.map((name) => `${name} as ${toNamedImport(name)}`)
			.join(', ')}
	} from 'proxyfill/runtime'
`)

const requireTemplate = template(`
  const {
		${runtimeApiFunctionNames
			.map((name) => `${name} as ${toNamedImport(name)}`)
			.join(', ')}
	} = require('proxyfill/runtime')
`)

export default function babelPluginProxyfill(): Babel.PluginObj<VisitorState> {
	return {
		name: 'proxyfill',
		visitor: {
			Program(path, {opts}: {opts: ProxyfillBabelPluginOptions}) {
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
		},
	}
}
