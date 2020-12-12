import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'

export default function AssignmentExpression(
	path: NodePath<t.AssignmentExpression>
) {
	const leftPath = path.get('left')
	if (!leftPath.isMemberExpression()) {
		return
	}

	const {object, property} = leftPath.node
	if (t.isPrivateName(property)) {
		return
	}
	const setter = callRuntime('set', object, property, path.get('right').node)
	path.replaceWith(setter)
}
