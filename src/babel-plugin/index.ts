import MemberExpression from './memberExpression'

import type * as Babel from '@babel/core'

export default function babelPluginProxyfill(): Babel.PluginObj<any> {
	return {
		name: 'proxyfill',
		visitor: {
			MemberExpression,
		},
	}
}
