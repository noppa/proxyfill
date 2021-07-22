import * as t from '@babel/types'
import {assertNotPrivateApiProp} from '../runtime/assertNotPrivateApiProp'
import {toNamedImport} from './constants'
import type {RuntimeFunctions} from '../runtime'

export type ParameterExpression = t.Expression | t.SpreadElement

function assertIdentifierIsNotPrivateApiProp(prop: ParameterExpression): void {
	if (t.isIdentifier(prop)) {
		assertNotPrivateApiProp(prop.name)
	}
}

type ArgsToAnyExpressions<Args extends any[]> = {
	[K in keyof Args]: ParameterExpression
} & {
	length: Args['length']
} & t.Expression[]

export function callRuntime<K extends keyof RuntimeFunctions>(
	key: K,
	...args: ArgsToAnyExpressions<Parameters<RuntimeFunctions[K]>>
): t.CallExpression {
	assertIdentifierIsNotPrivateApiProp(args[1])
	return t.callExpression(t.identifier(toNamedImport(key)), args)
}
