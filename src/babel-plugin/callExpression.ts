import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'

export default function CallExpression(path: NodePath<t.CallExpression>) {
	const parentPath = path.get('parent') as NodePath<unknown> // TODO: Can this be a list?
	const parent = parentPath
	if (!t.isMemberExpression(parent)) {
		// Direct call expressions are already handeled by the runtime Proxy
		// polyfill function. All we need to care call expressions on object
		// members, so we can invoke "get" and set the context correctly.
		return
	}
	const {object, property} = parent
	if (t.isPrivateName(property)) {
		// We can't pass #foo from this.#foo as a function argument.
		return
	}

	const args = t.arrayExpression(
		path.get('arguments').map(
			(_): t.Expression => {
				const {node} = _
				if (t.isArgumentPlaceholder(node)) {
					throw _.buildCodeFrameError(
						'ArgumentPlaceholders are currently not supported'
					)
				}
				if (t.isSpreadElement(node)) {
					// TODO: Fix types; spread element should be allowed
					return node as any
				}
				// TODO: Fix types & possible edge cases
				return node as any
			}
		)
	)

	const invokeExpr = callRuntime('invoke', object, property, args)
	parentPath.replaceWith(invokeExpr)
}
