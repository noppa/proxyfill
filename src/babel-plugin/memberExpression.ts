import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {apiFunctionCallExpression} from './useRuntime'

export default function MemberExpression(path: NodePath<t.MemberExpression>) {
	const {object, property} = path.node
	if (t.isPrivateName(property)) {
		// We can't pass #foo from this.#foo as a function argument.
		return
	}
	const propertyNormalized = t.isIdentifier(property)
		? t.stringLiteral(property.name)
		: property

	const getter = apiFunctionCallExpression('get', [
		object,
		propertyNormalized,
	])
	path.replaceWith(getter)
}
