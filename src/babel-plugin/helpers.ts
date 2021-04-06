import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {IgnoredPropertiesConfig, VisitorState} from './types'

type PropertyInfo = {
	object: t.Expression
	property: t.Expression
}

export function getPropertyOfMember(
	memberExpr: NodePath<t.MemberExpression> | NodePath<any>,
	ignoredProperties: undefined | null | IgnoredPropertiesConfig[]
): null | PropertyInfo {
	if (!memberExpr.isMemberExpression()) return null
	const memberNode: t.MemberExpression = memberExpr.node
	const {object, property, computed} = memberNode

	if (t.isPrivateName(property)) {
		return null
	}

	let propertyReference: t.Expression
	if (!computed && t.isIdentifier(property)) {
		const {name} = property
		if (shouldIgnoreProperty(object, name, ignoredProperties)) {
			return null
		}
		propertyReference = t.stringLiteral(name)
	} else {
		propertyReference = property
	}

	return {
		object,
		property: propertyReference,
	}
}

function shouldIgnoreProperty(
	obj: t.Expression,
	propName: string,
	ignoredProperties: undefined | null | IgnoredPropertiesConfig[]
) {
	if (!ignoredProperties?.length || !t.isIdentifier(obj)) {
		return false
	}

	const objName = obj.name
	return ignoredProperties.some(
		({objectIdentifierName, propertyIdentifierName}) =>
			(objectIdentifierName === '*' ||
				objectIdentifierName === objName) &&
			(propertyIdentifierName === '*' ||
				propertyIdentifierName === propName)
	)
}
