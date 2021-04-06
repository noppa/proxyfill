import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime, ParameterExpression} from './useRuntime'
import {getPropertyOfMember} from './helpers'
import {VisitorState} from './types'

export default function CallExpression(
	path: NodePath<t.CallExpression>,
	{opts}: VisitorState
) {
	const memberInfo = getPropertyOfMember(
		path.get('callee'),
		opts.ignoredProperties
	)
	if (!memberInfo) return
	const {object, property} = memberInfo

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
