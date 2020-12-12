import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime, ParameterExpression} from './useRuntime'

export default function CallExpression(path: NodePath<t.CallExpression>) {
	const calleePath = path.get('callee')
	if (!calleePath.isMemberExpression()) {
		// Direct call expressions are already handeled by the runtime Proxy
		// polyfill function. All we need to care call expressions on object
		// members, so we can invoke "get" and set the context correctly.
		return
	}

	const {object, property} = calleePath.node
	if (t.isPrivateName(property)) {
		// We can't pass #foo from this.#foo as a function argument.
		return
	}

	const args = t.arrayExpression(
		path.get('arguments').map(
			(_): ParameterExpression => {
				const {node} = _
				if (
					t.isArgumentPlaceholder(node) ||
					t.isJSXNamespacedName(node)
				) {
					throw _.buildCodeFrameError(
						'ArgumentPlaceholders are currently not supported'
					)
				}
				return node
			}
		)
	)

	const invokeExpr = callRuntime('invoke', object, property, args)
	path.replaceWith(invokeExpr)
}
