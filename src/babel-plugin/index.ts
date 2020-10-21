import MemberExpression from './memberExpression'

import type * as Babel from '@babel/core'
import * as t from '@babel/types'
import template from '@babel/template'
import { VisitorState } from './types'
import { namespaceName } from './constants'

const importTemplate = template(`
  import * as IMPORT_NAME from 'SOURCE'
`)

export default function babelPluginProxyfill(): Babel.PluginObj<VisitorState> {
	return {
		name: 'proxyfill',
		visitor: {
			Program(path) {
				const importRuntime = importTemplate({
					IMPORT_NAME: t.identifier(namespaceName),
					SOURCE: t.stringLiteral('proxyfill/runtime'),
				})
				path.unshiftContainer('body', importRuntime)
			},
			MemberExpression,
		},
	}
}
