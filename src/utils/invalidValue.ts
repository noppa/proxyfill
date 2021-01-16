export default function invalidValue(
	name: string,
	expectedType: string,
	actualValue: never
): any {
	throw new Error(
		`Expected option "${name}" to be ${expectedType}, but got ${String(
			actualValue
		)}`
	)
}
