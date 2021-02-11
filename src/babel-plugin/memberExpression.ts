import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember, shouldIgnoreProperty} from './helpers'
import {VisitorState} from './types'

export default function MemberExpression(
	path: NodePath<t.MemberExpression>,
	{opts}: VisitorState
) {
	const memberInfo = getPropertyOfMember(path)
	if (!memberInfo) return
	const {object, property} = memberInfo

	if (shouldIgnoreProperty(object, property, opts.ignoredProperties)) {
		return
	}

	const getter = callRuntime('get', object, property)
	path.replaceWith(getter)
}
