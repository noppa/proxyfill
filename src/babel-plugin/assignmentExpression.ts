import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'
import {VisitorState} from './types'

export default function AssignmentExpression(
	path: NodePath<t.AssignmentExpression>,
	{opts}: VisitorState
) {
	const memberInfo = getPropertyOfMember(
		path.get('left'),
		opts.ignoredProperties
	)
	if (!memberInfo) return

	const {object, property} = memberInfo

	const setter = callRuntime('set', object, property, path.get('right').node)
	path.replaceWith(setter)
}
