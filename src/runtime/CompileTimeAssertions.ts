export const enum CompileTimeAssertions {
	None = 0,
	PropertyIsIdentifier = 1 << 0,
	PropertyIsNotProxy = 1 << 1,
}
