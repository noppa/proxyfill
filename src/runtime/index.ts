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
const bind = isObject.bind
const slice = [].slice
const assign = Object.assign
const shallowClone = <T extends Record<string, any>>(obj: T): T =>
	assign({}, obj)

type ProxyPrivateApiContainer = {
	__proxyfill: {
		target: object
		handler: ProxyHandler<object>
		revokable: boolean
	}
}

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

	const proxyPrivateApi: ProxyPrivateApiContainer = {
		__proxyfill: {
			target,
			handler: shallowClone(handler),
			revokable,
		},
	}

	let proxy: any
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
		assign.call(proxy, proxyPrivateApi)
	} else if (target instanceof Array) {
		proxy = []
		assign.call(proxy, proxyPrivateApi)
	} else {
		proxy = proxyPrivateApi
	}

	return proxy
}

type PossiblyProxy = null | undefined | Partial<ProxyPrivateApiContainer>

function getProxyfillApi(
	obj: PossiblyProxy
): null | ProxyPrivateApiContainer['__proxyfill'] {
	const type = typeof obj
	return (
		(((type === 'object' && obj !== null) || type === 'function') &&
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			obj!.__proxyfill) ||
		null
	)
}

export function isNotProxy(obj: PossiblyProxy) {
	return !getProxyfillApi(obj)
}

const privateApiKey: keyof ProxyPrivateApiContainer = '__proxyfill'

/**
 *
 * @param obj Target object to get a value from, possibly a "Proxy" created with createProxy.
 * @param property Name of the property to get
 * @param notProxy Result of calling isNotProxy(obj) that can be used as an optimization
 * 		to skip the proxy check in places where properties of a constant object are accessed
 * 		multiple times.
 */
export function get(
	obj: PossiblyProxy,
	property: string,
	notProxy: boolean
): any {
	if (property === privateApiKey) {
		throw new Error('Cannot access private API of proxyfill library')
	}
	const api = !notProxy && getProxyfillApi(obj)
	if (api) {
		const handlers = api.handler
		const getHandler = handlers.get
		if (getHandler) {
			return getHandler.call(handlers, api.target, property, obj)
		}
	}

	return (obj as any)[property]
}

export function set(
	obj: PossiblyProxy,
	property: string,
	value: any,
	notProxy: boolean
): any {
	if (property === privateApiKey) {
		throw new Error('Cannot access private API of proxyfill library')
	}
	const api = !notProxy && getProxyfillApi(obj)
	if (api) {
		const handlers = api.handler
		const setHandler = handlers.set
		if (setHandler) {
			return setHandler.call(handlers, api.target, property, value, obj)
		}
	}

	return ((obj as any)[property] = value)
}

export function ProxyPolyfill(
	this: any,
	target: object,
	handler: ProxyHandler<object>
) {
	const isCalledWithNew = !!this && this instanceof ProxyPolyfill
	if (!isCalledWithNew) {
		throw new TypeError("Constructor Proxy requires 'new'")
	}

	return createProxy(target, handler, false)
}

ProxyPolyfill.revocable = function (
	target: object,
	handler: ProxyHandler<object>
) {
	return createProxy(target, handler, true)
}
