import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'
import {VisitorState} from './types'

export default function MemberExpression(
	path: NodePath<t.MemberExpression>,
	{opts}: VisitorState
) {
	const {parent} = path

	// If we are inside method call foo.bar(), let the CallExpression handler take care of it.
	const isCallee = t.isCallExpression(parent) && path.node === parent.callee
	if (isCallee) {
		return
	}

	const memberInfo = getPropertyOfMember(path, opts.ignoredProperties)
	if (!memberInfo) return
	const {object, property} = memberInfo

	const getter = callRuntime('get', object, property)
	path.replaceWith(getter)
}
