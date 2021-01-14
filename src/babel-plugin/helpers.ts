import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'

type PropertyInfo = {
	object: t.Expression
	property: t.Expression
}

export function getPropertyOfMember(
	memberExpr: NodePath<t.MemberExpression> | NodePath<any>
): null | PropertyInfo {
	if (!memberExpr.isMemberExpression()) return null
	const memberNode: t.MemberExpression = memberExpr.node
	const {object, property, computed} = memberNode

	if (t.isPrivateName(property)) {
		return null
	}

	const propertyReference =
		computed || !t.isIdentifier(property)
			? property
			: t.stringLiteral(property.name)

	return {
		object,
		property: propertyReference,
	}
}
