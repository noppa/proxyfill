import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {apiFunctionCallExpression} from './useRuntime'

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
	const propertyNormalized = t.isIdentifier(property)
		? t.stringLiteral(property.name)
		: property

	const getter = apiFunctionCallExpression('set', [
		object,
		propertyNormalized,
		path.get('right').node,
	])
	path.replaceWith(getter)
}
