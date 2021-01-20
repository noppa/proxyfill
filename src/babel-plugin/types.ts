export type ProxyfillBabelPluginOptions = {
	/**
	 * Controls how the Proxyfill internal dependencies
	 * are imported in the generated output.
	 *
	 * 'esmodule' (import syntax) is the default,
	 * setting this to 'none' omits generating any import
	 * statements whatsoever and assumes you have loaded
	 * the global runtime-global.js script instead.
	 */
	importStyle?: 'esmodule' | 'commonjs' | 'none'
}

export type VisitorState = {
	opts: ProxyfillBabelPluginOptions
}
