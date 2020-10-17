import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function MemberExpression(path: NodePath<t.MemberExpression>) {
	path.replaceWith(t.callExpression(t.identifier('foo'), []))
}
