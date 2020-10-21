import * as t from '@babel/types'
import { namespaceName } from './constants'

export function apiFunctionCallExpression(
	functionName: string,
	args: t.Expression[]
) {
	return t.callExpression(
		t.memberExpression(
			t.identifier(namespaceName),
			t.identifier(functionName)
		),
		args
	)
}
