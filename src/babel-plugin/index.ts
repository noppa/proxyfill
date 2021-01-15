import MemberExpression from './memberExpression'
import AssignmentExpression from './assignmentExpression'
import CallExpression from './callExpression'

import type * as Babel from '@babel/core'
import template from '@babel/template'
import {VisitorState} from './types'
import {toNamedImport} from './constants'
import {RuntimeFunctions} from '../runtime'

const runtimeFunctionsMap: {[k in keyof RuntimeFunctions]: 0} = {
	get: 0,
	set: 0,
	invoke: 0,
}

const runtimeApiFunctionNames = Object.keys(runtimeFunctionsMap)

const importTemplate = template(`
  import {
		${runtimeApiFunctionNames
			.map((name) => `${name} as ${toNamedImport(name)}`)
			.join(', ')}
	} from 'proxyfill/runtime'
`)

export default function babelPluginProxyfill(): Babel.PluginObj<VisitorState> {
	return {
		name: 'proxyfill',
		visitor: {
			Program(path) {
				const importRuntime = importTemplate()
				path.unshiftContainer('body', importRuntime)
			},
			MemberExpression,
			CallExpression,
			AssignmentExpression,
		},
	}
}
