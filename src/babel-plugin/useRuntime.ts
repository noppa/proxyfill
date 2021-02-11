import * as t from '@babel/types'
import {assertNotPrivateApiProp} from '../runtime/assertNotPrivateApiProp'
import {toNamedImport} from './constants'
import type {RuntimeFunctions} from '../runtime'
import type {IgnoredPropertiesConfig} from './types'

export type ParameterExpression = t.Expression | t.SpreadElement

function assertIdentifierIsNotPrivateApiProp(prop: ParameterExpression): void {
	if (t.isIdentifier(prop)) {
		assertNotPrivateApiProp(prop.name)
	}
}

function shouldIgnoreProperty(
	obj: t.Expression,
	prop: t.Expression,
	ignoredProperties: IgnoredPropertiesConfig[]
) {
	if (!t.isIdentifier(obj) || !t.isIdentifier(prop)) return false
	const objName = obj.name
	const propName = prop.name
	return ignoredProperties.some(config => config)
}

type ArgsToAnyExpressions<Args extends any[]> = {
	[K in keyof Args]: ParameterExpression
} & {
	length: Args['length']
} & t.Expression[]

export function callRuntime<K extends keyof RuntimeFunctions>(
	key: K,
	...args: ArgsToAnyExpressions<Parameters<RuntimeFunctions[K]>>
) {
	assertIdentifierIsNotPrivateApiProp(args[1])
	return t.callExpression(t.identifier(toNamedImport(key)), args)
}
