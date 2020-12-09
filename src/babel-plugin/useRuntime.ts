import * as t from '@babel/types'
import {assertNotPrivateApiProp} from '../runtime/assertNotPrivateApiProp'
import {CompileTimeAssertions} from '../runtime/CompileTimeAssertions'
import {toNamedImport} from './constants'

function validateAtCompileTimeIfPossible(
	prop: t.Expression
): prop is t.Identifier {
	if (t.isIdentifier(prop)) {
		assertNotPrivateApiProp(prop.name)
		return true
	}
	return false
}

type NotProxyParam = boolean | t.Identifier

function createAssertionsFlag(
	property: t.Expression,
	notProxy: NotProxyParam
): t.Expression {
	let assertions = CompileTimeAssertions.None
	if (validateAtCompileTimeIfPossible(property)) {
		// No need to validate at runtime
		assertions |= CompileTimeAssertions.PropertyIsIdentifier
	}
	if (typeof notProxy === 'boolean') {
		if (notProxy) {
			assertions |= CompileTimeAssertions.PropertyIsNotProxy
		}
		return t.numericLiteral(assertions)
	} else {
		return t.binaryExpression('|', t.numericLiteral(assertions), notProxy)
	}
}

export function callGet(
	obj: t.Expression,
	property: t.Expression,
	notProxy: NotProxyParam = false
): t.Expression {
	return t.callExpression(t.identifier(toNamedImport('get')), [
		obj,
		property,
		createAssertionsFlag(property, notProxy),
	])
}

export function callSet(
	obj: t.Expression,
	property: t.Expression,
	value: t.Expression,
	notProxy: NotProxyParam = false
): t.Expression {
	return t.callExpression(t.identifier(toNamedImport('set')), [
		obj,
		property,
		value,
		createAssertionsFlag(property, notProxy),
	])
}
