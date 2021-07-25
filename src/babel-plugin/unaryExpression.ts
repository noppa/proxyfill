import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'

export default function UnaryExpression(path: NodePath<t.UnaryExpression>) {
	if (path.node.operator !== 'delete') {
		return
	}
	const memberInfo = getPropertyOfMember(path.get('argument'), undefined)
	if (!memberInfo) return
	const {object, property} = memberInfo

	const hasExpr = callRuntime('deleteProperty', object, property)
	path.replaceWith(hasExpr)
}
