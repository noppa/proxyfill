import * as t from '@babel/types'
import {assertNotPrivateApiProp} from '../runtime/assertNotPrivateApiProp'
import {toNamedImport} from './constants'

function assertIdentifierIsNotPrivateApiProp(prop: t.Expression): void {
	if (t.isIdentifier(prop)) {
		assertNotPrivateApiProp(prop.name)
	}
}

export function callGet(
	obj: t.Expression,
	property: t.Expression
): t.Expression {
	assertIdentifierIsNotPrivateApiProp(property)
	return t.callExpression(t.identifier(toNamedImport('get')), [obj, property])
}

export function callSet(
	obj: t.Expression,
	property: t.Expression,
	value: t.Expression
): t.Expression {
	assertIdentifierIsNotPrivateApiProp(property)
	return t.callExpression(t.identifier(toNamedImport('set')), [
		obj,
		property,
		value,
	])
}
