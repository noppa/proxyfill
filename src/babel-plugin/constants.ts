export const namespaceName = '_proxyfillRuntime'
export const toNamedImport = (methodName: string) =>
	`${namespaceName}$${methodName}`
