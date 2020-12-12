import * as t from '@babel/types'
import {assertNotPrivateApiProp} from '../runtime/assertNotPrivateApiProp'
import {toNamedImport} from './constants'
import type {RuntimeFunctions} from '../runtime'

function assertIdentifierIsNotPrivateApiProp(prop: t.Expression): void {
	if (t.isIdentifier(prop)) {
		assertNotPrivateApiProp(prop.name)
	}
}

type ArgsToAnyExpressions<Args extends any[]> = {
	[K in keyof Args]: t.Expression
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
