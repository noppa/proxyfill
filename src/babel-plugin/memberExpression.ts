import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import { apiFunctionCallExpression } from './useRuntime'
import { namespaceName } from './constants'

export default function MemberExpression(path: NodePath<t.MemberExpression>) {
	const { object, property } = path.node
	if (t.isIdentifier(object) && object.name === namespaceName) {
		// It seems we have visited this node already.
		// No need to wrap the generated proxyfill/runtime api calls.
		return
	}
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
