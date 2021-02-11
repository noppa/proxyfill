import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {IgnoredPropertiesConfig} from './types'

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

export function shouldIgnoreProperty(
	obj: t.Expression,
	prop: t.Expression,
	ignoredProperties: IgnoredPropertiesConfig[]
) {
	if (!t.isIdentifier(obj) || !t.isIdentifier(prop)) return false
	const objName = obj.name
	const propName = prop.name
	return ignoredProperties.some(
		(config) =>
			config.objectIdentifierName === objName &&
			config.propertyIdentifierName === propName
	)
}
