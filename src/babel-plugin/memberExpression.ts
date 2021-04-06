import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'
import {VisitorState} from './types'

export default function MemberExpression(
	path: NodePath<t.MemberExpression>,
	{opts}: VisitorState
) {
	const memberInfo = getPropertyOfMember(path, opts.ignoredProperties)
	if (!memberInfo) return
	const {object, property} = memberInfo

	const getter = callRuntime('get', object, property)
	path.replaceWith(getter)
}
