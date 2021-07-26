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

function isObject(
	val: unknown
): val is NonNullable<{} | Function | PossiblyProxy> {
	if (!val) return false
	const t = typeof val
	return t === 'object' || t === 'function'
}

const {bind, apply} = isObject
const {slice} = []
const Object$hasOwnProperty = {}.hasOwnProperty
const {
	assign: Object$assign,
	defineProperty: Object$defineProperty,
	defineProperties: Object$defineProperties,
	keys: Object$keys,
	getOwnPropertyNames: Object$getOwnPropertyNames,
	getOwnPropertySymbols: Object$getOwnPropertySymbols,
	getOwnPropertyDescriptor: Object$getOwnPropertyDescriptor,
} = Object
const {
	ownKeys: Reflect$ownKeys,
	defineProperty: Reflect$defineProperty,
	get: Reflect$get,
	set: Reflect$set,
	deleteProperty: Reflect$deleteProperty,
} = Reflect
const NativeProxy = typeof Proxy === 'function' ? Proxy : null
let PolyfilledSymbolConstr: null | Function = null
if (typeof Symbol === 'function') {
	try {
		const s = Symbol()
		if (typeof s === 'object' && (s as any) instanceof Symbol) {
			PolyfilledSymbolConstr = Symbol
		}
		// eslint-disable-next-line no-empty
	} catch (err) {}
}

/**
 * toString implementation that does not call any traps if `target` is a Proxy
 */
function toString(target: unknown): string {
	if (isObject(target)) {
		const api = getProxyfillApi(target as PossiblyProxy)
		if (api) {
			const typeStr = typeof target === 'function' ? 'Function' : 'Object'
			return `[object ${typeStr}]`
		}
	}
	return String(target)
}

// Custom implementations for some of the JS standard library functions
// that we need to polyfill / ponyfill to get things working correctly.

const reflectDefinePropertyPolyfill = function defineProperty(
	object: PossiblyProxy,
	key: string | symbol,
	desc: PropertyDescriptor
): boolean {
	const api = getProxyfillApi(object)
	if (api) {
		const {handler} = api
		const {defineProperty} = handler
		if (defineProperty) {
			const propName = normalizeProperty(key)
			// TODO: Normalize property descriptor "desc"
			return defineProperty.call(handler, api.target, propName, desc)
		}
		object = api.target
	}
	return Reflect$defineProperty(object as object, key, desc)
}

const objectDefinePropertyPolyfill = function defineProperty(
	object: PossiblyProxy,
	key: string | symbol,
	descr: PropertyDescriptor
): PossiblyProxy {
	const success = reflectDefinePropertyPolyfill(object, key, descr)
	if (!success) {
		throw new TypeError(
			`'defineProperty' on proxy: trap returned falsish for property '${toString(
				key
			)}'`
		)
	}
	return object
}

const objectDefinePropertiesPolyfill = function defineProperties(
	object: PossiblyProxy,
	descs: PropertyDescriptorMap
): PossiblyProxy {
	const api = getProxyfillApi(object)
	const descsApi = getProxyfillApi(descs)
	if (api || descsApi) {
		const keys = objectKeysPolyfill(descs)
		for (let i = 0, n = keys.length; i < n; i++) {
			const key = keys[i]
			objectDefinePropertyPolyfill(object, key, descs[i])
		}
		return object
	}
	return Object$defineProperties(object, descs)
}

const getOwnPropertyDescriptorPolyfill = function getOwnPropertyDescriptor(
	object: PossiblyProxy,
	key: string
): undefined | PropertyDescriptor {
	// Proxy constructor is an exotic function that has no "prototype" at all
	if (object === Proxy && key === 'prototype') {
		return
	}
	const api = getProxyfillApi(object)
	if (api) {
		assertNotRevoked(api, 'getOwnPropertyDescriptor')
		const {handler} = api
		const {getOwnPropertyDescriptor} = handler
		if (getOwnPropertyDescriptor) {
			return getOwnPropertyDescriptor.call(handler, api.target, key)
		}
		object = api.target
	}
	return Object$getOwnPropertyDescriptor(object, key)
}

function getOwnKeysFromProxy(
	api: ProxyfillPrivateApi,
	predicate: (key: string | symbol, object: PossiblyProxy) => boolean,
	object: PossiblyProxy
): (string | symbol)[] {
	assertNotRevoked(api, 'ownKeys')
	const {handler} = api
	const {ownKeys} = handler
	if (ownKeys) {
		const keys = ownKeys.call(handler, api.target)
		// TODO: Frozen & sealed target objects have limitations on keys that handler should
		// return and we should throw if they are not correct
		const validKeys = []
		for (let i = 0, n = keys.length; i < n; i++) {
			const key = keys[i]
			if (isString(key) || isSymbol(key)) {
				if (predicate(key, object)) {
					validKeys.push(key)
				}
			} else {
				throw new TypeError(`${toString(key)} is not a valid property name`)
			}
		}
		return validKeys
	}
	return Reflect$ownKeys(api.target)
}

function isOwnEnumerableStringKey(
	key: string | symbol,
	object: PossiblyProxy
): boolean {
	if (typeof key !== 'string') return false
	const desc = getOwnPropertyDescriptorPolyfill(object, key)
	return desc !== undefined && desc.enumerable === true
}

function isString(key: string | symbol): key is string {
	return typeof key === 'string'
}

function isSymbol(key: string | symbol): key is symbol {
	const type = typeof key
	return (
		type === 'symbol' ||
		// core-js polyfilled Symbols are objects that are instances of the global Symbol function
		(!!PolyfilledSymbolConstr &&
			type === 'object' &&
			key !== null &&
			(key as any) instanceof PolyfilledSymbolConstr)
	)
}

const objectKeysPolyfill = function keys(object: PossiblyProxy): string[] {
	const api = getProxyfillApi(object)
	if (api) {
		return getOwnKeysFromProxy(
			api,
			isOwnEnumerableStringKey,
			object
		) as string[]
	}
	return Object$keys(object as {})
}

const getOwnPropertyNamesPolyfill = function getOwnPropertyNames(
	object: PossiblyProxy
) {
	const api = getProxyfillApi(object)
	if (api) {
		return getOwnKeysFromProxy(api, isString, object)
	}
	return Object$getOwnPropertyNames(object)
}

const getOwnPropertySymbolsPolyfill = function getOwnPropertyNames(
	object: PossiblyProxy
) {
	const api = getProxyfillApi(object)
	if (api) {
		return getOwnKeysFromProxy(api, isSymbol, object)
	}
	return Object$getOwnPropertyNames(object)
}

function hasOwnPropertyStatic(object: PossiblyProxy, key: string): boolean {
	const descr = getOwnPropertyDescriptorPolyfill(object, key)
	return !!descr
}

const hasOwnPropertyPolyfill = function hasOwnProperty(
	this: PossiblyProxy,
	key: string
) {
	return hasOwnPropertyStatic(this, key)
}

const assignPolyfill: typeof Object['assign'] = function assign(
	target: any,
	source: any // Needed to make .length = 2
	/* ...rest */
): any {
	if (target === null || target === undefined) {
		throw new TypeError('Cannot convert undefined or null to object')
	}
	// Optimization for the common case: two arguments, neither of which
	// is Proxy, just delegate to built-in Object.assign
	if (arguments.length === 2 && !isProxy(target) && !isProxy(source)) {
		return Object$assign(target, source)
	}

	const to = Object(target)

	for (let index = 1; index < arguments.length; index++) {
		const nextSource = arguments[index]

		if (nextSource !== null && nextSource !== undefined) {
			for (const nextKey in nextSource) {
				if (hasOwnPropertyStatic(nextSource, nextKey)) {
					set(to, nextKey, get(nextSource, nextKey))
				}
			}
		}
	}
	return to
}

type PolyfillDef = {
	orig: Function
	mod: Function
}

Proxy

const standardLibraryPolyfills: PolyfillDef[] = [
	{
		orig: Object$defineProperty,
		mod: objectDefinePropertyPolyfill,
	},
	{
		orig: Reflect$defineProperty,
		mod: reflectDefinePropertyPolyfill,
	},
	{
		orig: Object$defineProperties,
		mod: objectDefinePropertiesPolyfill,
	},
	{
		orig: Object$getOwnPropertyDescriptor,
		mod: getOwnPropertyDescriptorPolyfill,
	},
	{
		orig: Object$getOwnPropertyNames,
		mod: getOwnPropertyNamesPolyfill,
	},
	{
		orig: Object$getOwnPropertySymbols,
		mod: getOwnPropertySymbolsPolyfill,
	},
	{
		orig: Object$keys,
		mod: objectKeysPolyfill,
	},
	{
		orig: Object$hasOwnProperty,
		mod: hasOwnPropertyPolyfill,
	},
	{
		orig: Object$assign,
		mod: assignPolyfill,
	},
	{
		orig: Reflect$get,
		mod: get,
	},
	{
		orig: Reflect$set,
		mod: set,
	},
	{
		orig: Reflect$deleteProperty,
		mod: deleteProperty,
	},
]

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
			handler,
			revoked: false,
		},
	}

	let proxy: any
	if (typeof target === 'function') {
		proxy = function ProxyPolyfill(this: any) {
			const usingNew = !!this && this.constructor === proxy
			const args: any[] = slice.call(arguments)

			// since the target was a function, fallback to calling it directly.
			if (usingNew) {
				assertNotRevoked(proxy.__proxyfill, 'construct')
				if (handler.construct) {
					return handler.construct.call(this, target, args, proxy)
				}
				// inspired by answers to https://stackoverflow.com/q/1606797
				args.unshift(target)
				const ProxyTargetConstructor = bind.apply<Function, any, any>(
					target,
					args
				)
				return new ProxyTargetConstructor()
			} else {
				assertNotRevoked(proxy.__proxyfill, 'apply')
				if (handler.apply) {
					return handler.apply(target, this, args)
				}
				return target.apply(this, args)
			}
		}
		Object$assign(proxy, proxyPrivateApi)
	} else if (target instanceof Array) {
		proxy = []
		Object$assign(proxy, proxyPrivateApi)
	} else {
		proxy = proxyPrivateApi
	}

	// Install top-level getter traps for symbols & methods
	// that the ES runtime might call automatically, for example
	// to convert the value to a number with `+foo`.
	let runtimeTraps: (string | symbol)[]
	const _Symbol = typeof Symbol !== 'undefined' && Symbol
	if (_Symbol) {
		// Spec: Well-known Symbols
		// https://www.ecma-international.org/ecma-262/11.0/index.html#table-1
		runtimeTraps = [
			_Symbol.asyncIterator,
			_Symbol.hasInstance,
			_Symbol.isConcatSpreadable,
			_Symbol.iterator,
			_Symbol.match,
			_Symbol.matchAll,
			_Symbol.replace,
			_Symbol.search,
			_Symbol.species,
			_Symbol.split,
			_Symbol.toPrimitive,
			_Symbol.toStringTag,
			_Symbol.unscopables,
		].filter(Boolean)
	} else {
		runtimeTraps = []
	}
	runtimeTraps.push('valueOf', 'toString', 'toJSON')

	for (let i = 0; i < runtimeTraps.length; i++) {
		const trap = runtimeTraps[i]
		Object$defineProperty(proxy, trap, {
			get: () => get(proxy, trap),
		})
	}

	return proxy
}
type PossiblyProxy = null | undefined | Partial<ProxyPrivateApiContainer>

function getProxyfillApi(obj: PossiblyProxy): null | ProxyfillPrivateApi {
	return (isObject(obj) && obj.__proxyfill) || null
}

function isProxy(obj: PossiblyProxy): obj is ProxyPrivateApiContainer {
	return !!getProxyfillApi(obj)
}

function assertNotRevoked(
	api: null | undefined | ProxyfillPrivateApi,
	op: string
) {
	if (api && api.revoked) {
		throw new TypeError(`Cannot perform ${op} on a proxy that has been revoked`)
	}
}

function normalizeProperty(propertyName: any): string | symbol {
	const t = typeof propertyName
	if (t === 'string' || t === 'symbol') {
		assertNotPrivateApiProp(propertyName)
		return propertyName
	}

	return '' + propertyName
}

/**
 *
 * @param obj Target object to get a value from, possibly a "Proxy" created with createProxy.
 * @param propName Name of the property to get
 * @param notProxy Result of calling isNotProxy(obj) that can be used as an optimization
 * 		to skip the proxy check in places where properties of a constant object are accessed
 * 		multiple times.
 */
export function get(obj: PossiblyProxy, property: unknown): unknown {
	// NOTE: Stringifying obj here, by using console.log, for example, can cause
	// inifinite loop because the proxy has Symbol.toPrimitive trap set to call
	// this function again.

	const propName = normalizeProperty(property)
	const api = getProxyfillApi(obj)

	let val: any

	if (api) {
		assertNotRevoked(api, 'get')
		const handlers = api.handler
		const getHandler = handlers.get
		if (getHandler) {
			val = getHandler.call(handlers, api.target, propName as any, obj)
		} else {
			val = get(api.target, propName)
		}
	} else {
		val = (obj as any)[propName]
	}

	for (let i = 0, n = standardLibraryPolyfills.length; i < n; i++) {
		const p = standardLibraryPolyfills[i]
		if (val === p.orig) {
			// Don't let userland code bind original versions of polyfilled standard library
			// functions to variables, return the polyfill instead.
			return p.mod
		}
	}

	return val
}

export function invoke(
	obj: PossiblyProxy,
	property: string | symbol | unknown,
	args: unknown[]
): unknown {
	const fn: any = get(obj, property)
	if (typeof fn !== 'function') {
		throw new TypeError(`${String(property)} is not a function`)
	}

	for (let i = 0, n = standardLibraryPolyfills.length; i < n; i++) {
		const p = standardLibraryPolyfills[i]
		if (fn === p.orig) {
			// Some standard lib functions, like {}.hasOwnPrototype
			// need special handling to make some Proxy traps work
			return p.mod.apply(obj, args)
		}
	}

	return apply.call(fn, obj, args)
}

export function set(
	obj: PossiblyProxy,
	property: unknown,
	value: unknown
): unknown {
	const propName = normalizeProperty(property)
	const api = getProxyfillApi(obj)

	if (api) {
		assertNotRevoked(api, 'set')
		const handlers = api.handler
		const setHandler = handlers.set
		if (setHandler) {
			const result = setHandler.call(handlers, api.target, propName, value, obj)
			if (!result) {
				// Assume strict mode and throw for failed assignment
				throw new TypeError(
					`'set' on proxy: trap returned falsish for property '${toString(
						propName
					)}'`
				)
			}
			return value
		} else {
			return set(api.target, propName, value)
		}
	} else {
		return ((obj as any)[propName] = value)
	}
}

export function updateProperty(
	object: PossiblyProxy,
	property: unknown,
	prefix: 1 | 0,
	incrementBy: 1 | -1
): number {
	const current = +(get(object, property) as any)
	const next = current + incrementBy
	set(object, property, next)
	return prefix ? next : current
}

export function has(property: unknown, obj: PossiblyProxy): boolean {
	const api = getProxyfillApi(obj)
	const propName = normalizeProperty(property)

	if (api) {
		assertNotRevoked(api, 'has')
		const handlers = api.handler
		const hasHandler = handlers.has
		if (hasHandler) {
			return !!hasHandler.call(handlers, api.target, propName)
		} else {
			return has(propName, api.target)
		}
	} else {
		return (propName as any) in (obj as any)
	}
}

export function deleteProperty(
	object: PossiblyProxy,
	key: string | symbol
): boolean {
	const api = getProxyfillApi(object)
	const propName = normalizeProperty(key)

	if (api) {
		assertNotRevoked(api, 'deleteProperty')
		const handlers = api.handler
		const deleteHandler = handlers.deleteProperty
		// TODO: Assert that the object is extensible and property is configurable
		if (deleteHandler) {
			return !!deleteHandler.call(handlers, api.target, propName)
		} else {
			return deleteProperty(api.target, propName)
		}
	} else {
		return delete (object as any)[propName]
	}
}

export type RuntimeFunctions = {
	get: typeof get
	invoke: typeof invoke
	set: typeof set
	has: typeof has
	deleteProperty: typeof deleteProperty
	updateProperty: typeof updateProperty
}

interface IProxy {
	new (target: object, handler: ProxyHandler<object>): any
	revocable(target: object, handler: ProxyHandler<object>): any
}

const ProxyPolyfill: IProxy = function Proxy(
	this: any,
	target: object,
	handler: ProxyHandler<object>
) {
	const isCalledWithNew = !!this && this instanceof Proxy
	if (!isCalledWithNew) {
		throw new TypeError("Constructor Proxy requires 'new'")
	}

	return createProxy(target, handler)
} as any

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

if (NativeProxy) {
	standardLibraryPolyfills.push({
		orig: NativeProxy,
		mod: ProxyPolyfill,
	})
}

export {ProxyPolyfill as Proxy}
