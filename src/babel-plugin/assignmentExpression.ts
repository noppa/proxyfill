import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'

export default function AssignmentExpression(
	path: NodePath<t.AssignmentExpression>
) {
	const memberInfo = getPropertyOfMember(path.get('left'))
	if (!memberInfo) return

	const {object, property} = memberInfo
	const setter = callRuntime('set', object, property, path.get('right').node)
	path.replaceWith(setter)
}
