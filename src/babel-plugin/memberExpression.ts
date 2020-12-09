import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callGet} from './useRuntime'

export default function MemberExpression(path: NodePath<t.MemberExpression>) {
	const {object, property} = path.node
	if (t.isPrivateName(property)) {
		// We can't pass #foo from this.#foo as a function argument.
		return
	}

	const getter = callGet(object, property, false)
	path.replaceWith(getter)
}
