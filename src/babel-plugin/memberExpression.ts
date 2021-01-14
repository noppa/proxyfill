import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {callRuntime} from './useRuntime'
import {getPropertyOfMember} from './helpers'

export default function MemberExpression(path: NodePath<t.MemberExpression>) {
	const memberInfo = getPropertyOfMember(path)
	if (!memberInfo) return
	const {object, property} = memberInfo

	const getter = callRuntime('get', object, property)
	path.replaceWith(getter)
}
