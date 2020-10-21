import * as t from '@babel/types'
import {toNamedImport} from './constants'

export function apiFunctionCallExpression(
	functionName: string,
	args: t.Expression[]
) {
	return t.callExpression(t.identifier(toNamedImport(functionName)), args)
}
