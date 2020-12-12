import MemberExpression from './memberExpression'
import AssignmentExpression from './assignmentExpression'
import CallExpression from './callExpression'

import type * as Babel from '@babel/core'
import template from '@babel/template'
import {VisitorState} from './types'
import {toNamedImport} from './constants'

import * as runtime from '../runtime'

const runtimeApiFunctionNames = Object.keys(runtime).filter(
	(name) => name !== '__esModule'
)

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
