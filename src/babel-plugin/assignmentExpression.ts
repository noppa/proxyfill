import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember, shouldIgnoreProperty} from './helpers'
import {VisitorState} from './types'

export default function AssignmentExpression(
	path: NodePath<t.AssignmentExpression>,
	{opts}: VisitorState
) {
	const memberInfo = getPropertyOfMember(path.get('left'))
	if (!memberInfo) return

	const {object, property} = memberInfo

	if (shouldIgnoreProperty(object, property, opts.ignoredProperties)) {
		return
	}

	const setter = callRuntime('set', object, property, path.get('right').node)
	path.replaceWith(setter)
}
