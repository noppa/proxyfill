import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'

export default function BinaryExpression(path: NodePath<t.BinaryExpression>) {
	if (path.node.operator !== 'in') {
		return
	}
	const key = path.get('left').node
	if (t.isPrivateName(key)) {
		return
	}

	const hasExpr = callRuntime('has', key, path.get('right').node)
	path.replaceWith(hasExpr)
}
