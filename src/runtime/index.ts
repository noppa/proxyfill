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

import {assertNotPrivateApiProp} from './assertNotPrivateApiProp'
import type {ProxyPrivateApiContainer, ProxyfillPrivateApi} from './constants'

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

function createProxy(
	// eslint-disable-next-line @typescript-eslint/ban-types
	target: object,
	// eslint-disable-next-line @typescript-eslint/ban-types
	handler: ProxyHandler<object>
): ProxyPrivateApiContainer {
	if (!isObject(target) || !isObject(handler)) {
		throw new TypeError(
			'Cannot create proxy with a non-object as target or handler'
		)
	}

	const proxyPrivateApi: ProxyPrivateApiContainer = {
		__proxyfill: {
			target,
			handler: shallowClone(handler),
			revoked: false,
		},
	}

	let proxy: any
	if (typeof target === 'function') {
		proxy = function ProxyPolyfill(this: any) {
			const usingNew = !!this && this.constructor === proxy
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
				const ProxyTargetConstructor = bind.apply<Function, any, any>(
					target,
					args
				)
				return new ProxyTargetConstructor()
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

function getProxyfillApi(obj: PossiblyProxy): null | ProxyfillPrivateApi {
	const type = typeof obj
	return (
		(((type === 'object' && obj !== null) || type === 'function') &&
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			obj!.__proxyfill) ||
		null
	)
}

function assertNotRevoked(api: ProxyfillPrivateApi, op: string) {
	if (api.revoked) {
		throw new Error(`Cannot perform ${op} on a proxy that has been revoked`)
	}
}

export function isNotProxy(obj: PossiblyProxy) {
	return !getProxyfillApi(obj)
}

/**
 *
 * @param obj Target object to get a value from, possibly a "Proxy" created with createProxy.
 * @param property Name of the property to get
 * @param notProxy Result of calling isNotProxy(obj) that can be used as an optimization
 * 		to skip the proxy check in places where properties of a constant object are accessed
 * 		multiple times.
 */
export function get(obj: PossiblyProxy, property: unknown): any {
	assertNotPrivateApiProp(property)

	const api = getProxyfillApi(obj)

	if (api) {
		assertNotRevoked(api, 'get')
		const handlers = api.handler
		const getHandler = handlers.get
		if (getHandler) {
			return getHandler.call(handlers, api.target, property as any, obj)
		}
	}

	return (obj as any)[property as any]
}

export type ProxyfillRuntimeGet = typeof get

export function set(obj: PossiblyProxy, property: string, value: any): any {
	assertNotPrivateApiProp(property)

	const api = getProxyfillApi(obj)

	if (api) {
		assertNotRevoked(api, 'set')
		const handlers = api.handler
		const setHandler = handlers.set
		if (setHandler) {
			return setHandler.call(handlers, api.target, property, value, obj)
		}
	}

	return ((obj as any)[property] = value)
}

export type ProxyfillRuntimeSet = typeof set

export function ProxyPolyfill(
	this: any,
	target: object,
	handler: ProxyHandler<object>
) {
	const isCalledWithNew = !!this && this instanceof ProxyPolyfill
	if (!isCalledWithNew) {
		throw new TypeError("Constructor Proxy requires 'new'")
	}

	return createProxy(target, handler)
}

ProxyPolyfill.revocable = function (
	target: object,
	handler: ProxyHandler<object>
) {
	const proxy = createProxy(target, handler)
	function revoke() {
		proxy.__proxyfill.revoked = true
	}
	return {proxy, revoke}
}
