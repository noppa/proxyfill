/*
 * The Proxy implementation in this file is derived from
 * the implementation of Google's proxy-polyfill
 * https://github.com/GoogleChrome/proxy-polyfill/blob/f667dd4b25355b99a264e56d101307d50807e187/src/proxy.js
 * which is licensed under Apache License, Version 2.0.
 * https://github.com/GoogleChrome/proxy-polyfill/blob/f667dd4b25355b99a264e56d101307d50807e187/LICENSE
 *
 * Some code changes has been made to the original implementation in order to
 * fit into the code style and goals of this project.
 */

/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/ban-types */

function isObject(val: unknown) {
	if (!val) return false
	const t = typeof val
	return t === 'object' || t === 'function'
}

const slice = [].slice
const bind = isObject.bind

function createProxy(
	// eslint-disable-next-line @typescript-eslint/ban-types
	target: object,
	// eslint-disable-next-line @typescript-eslint/ban-types
	handler: ProxyHandler<object>,
	revokable: boolean
) {
	if (!isObject(target) || !isObject(handler)) {
		throw new TypeError(
			'Cannot create proxy with a non-object as target or handler'
		)
	}

	let proxy: any
	let type: 'function' | 'array'
	if (typeof target === 'function') {
		proxy = function ProxyPolyfill(this: any) {
			const usingNew = this && this.constructor === proxy
			const args: any[] = slice.call(arguments)

			if (usingNew && handler.construct) {
				return handler.construct.call(this, target, args)
			} else if (!usingNew && handler.apply) {
				return handler.apply(target, this, args)
			}

			// since the target was a function, fallback to calling it directly.
			if (usingNew) {
				// inspired by answers to https://stackoverflow.com/q/1606797
				args.unshift(target)
				const f = bind.apply<Function, any, any>(target, args)
				return new f()
			}
			return target.apply(this, args)
		}
		type = 'function'
	} else if (target instanceof Array) {
		proxy = []
		type = 'array'
	}

	return proxy
}

export function get(obj, property) {}
export function set(obj, property, value) {}
