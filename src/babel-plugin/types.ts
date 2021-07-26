export type IgnoredPropertiesConfig = {
	objectIdentifierName: string | '*'
	propertyIdentifierName: string | '*'
}

export type ProxyfillBabelPluginOptions = {
	skipImports?: boolean
	ignoredProperties?: IgnoredPropertiesConfig[]
}

export type VisitorState = {
	opts: ProxyfillBabelPluginOptions
}
