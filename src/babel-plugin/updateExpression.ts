import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'

// foo.bar++, --foo.bar, etc
export default function UpdateExpression(path: NodePath<t.UpdateExpression>) {
	const memberInfo = getPropertyOfMember(path.get('argument'), undefined)
	if (!memberInfo) {
		return
	}
	const {object, property} = memberInfo
	const incrementBy = t.valueToNode(path.node.operator === '++' ? 1 : -1)
	const prefix = t.valueToNode(path.node.prefix ? 1 : 0)

	const updateExpr = callRuntime(
		'updateProperty',
		object,
		property,
		prefix,
		incrementBy
	)
	path.replaceWith(updateExpr)
}
