import * as t from '@babel/types'
import {NodePath} from '@babel/traverse'
import {IgnoredPropertiesConfig, VisitorState} from './types'
import {namespaceName} from './constants'

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
		if (shouldIgnoreProperty(object, property, ignoredProperties)) {
			return null
		}
		propertyReference = property
	}

	return {
		object,
		property: propertyReference,
	}
}

function shouldIgnoreProperty(
	obj: t.Expression,
	propName: string | t.Expression,
	ignoredProperties: undefined | null | IgnoredPropertiesConfig[]
) {
	// TODO: Even if obj is a dynamic expression, we should ignore property
	// with config { objectIdentifierName: '*', propertyIdentifierName: 'foo' }
	if (!t.isIdentifier(obj)) {
		return false
	}
	const objName = obj.name

	if (objName === namespaceName) {
		// Don't transform access to the imported module, e.g.
		// var proxyfillRuntime$get = _proxyfillRuntime['get'];
		// should not be converted to
		// var proxyfillRuntime$get = proxyfillRuntime$get(__proxyfillRuntime, 'get')
		return true
	}

	// TODO: Even if propName is dynamic expression, we should ignore property
	// with config { objectIdentifierName: 'foo', propertyIdentifierName: '*' }
	if (typeof propName !== 'string' || !ignoredProperties?.length) {
		return false
	}

	return ignoredProperties.some(
		({objectIdentifierName, propertyIdentifierName}) =>
			(objectIdentifierName === '*' ||
				objectIdentifierName === objName) &&
			(propertyIdentifierName === '*' ||
				propertyIdentifierName === propName)
	)
}
