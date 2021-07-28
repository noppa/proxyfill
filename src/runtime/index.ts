'use strict'
import {concat, includes} from '../utils/arrayHelpers'
/*
 * The Proxy implementation was originally derived from
 * the implementation of Google's proxy-polyfill
 * https://github.com/GoogleChrome/proxy-polyfill/blob/f667dd4b25355b99a264e56d101307d50807e187/src/proxy.js
 * which is licensed under Apache License, Version 2.0.
 * https://github.com/GoogleChrome/proxy-polyfill/blob/f667dd4b25355b99a264e56d101307d50807e187/LICENSE
 *
 * It's also taken inspiration from harmony-reflect shim for Reflect and Proxy, by
 * Software Languages Lab, Vrije Universiteit Brussel and Tom Van Cutsem
 * https://github.com/tvcutsem/harmony-reflect/blob/e34ed05a61c49b14aa494c954f304672e10a432f/reflect.js
 * which is dual-licensed under the Apache License 2.0 or MPL 1.1
 * https://github.com/tvcutsem/harmony-reflect/blob/e34ed05a61c49b14aa494c954f304672e10a432f/LICENSE
 *
 * The code has since diverged a lot from the original implementation in order to
 * fit into the code style and goals of this project. However, some implementation details,
 * variable names and patterns may still remain similar to the ones in above two projects.
 *
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

const getReflect = (): typeof Reflect | null =>
	typeof Reflect !== 'undefined' ? Reflect : null

const getObject = () => Object
const NativeProxy = typeof Proxy === 'function' ? Proxy : null

const noop: (...args: any[]) => any = () => {}

const getNativeApi = <T, K extends keyof T>(
	api: () => null | T,
	funcName: K
): T[K] => api()?.[funcName] ?? (noop as any)

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
function safeToString(target: unknown): string {
	try {
		if (isObject(target)) {
			const api = getProxyfillApi(target as PossiblyProxy)
			if (api) {
				const typeStr = typeof target === 'function' ? 'Function' : 'Object'
				return `[object ${typeStr}]`
			}
		}
		return String(target)
	} catch (err) {
		logWarning(err)
		return '<unknown value>'
	}
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

	const Reflect$defineProperty = getNativeApi(getReflect, 'defineProperty')
	if (Reflect$defineProperty === noop) {
		try {
			getNativeApi(getObject, 'defineProperty')(object as object, key, desc)
			return true
		} catch (err) {
			return false
		}
	}
	return getNativeApi(getReflect, 'defineProperty')(object as object, key, desc)
}

const objectDefinePropertyPolyfill = function defineProperty(
	object: PossiblyProxy,
	key: string | symbol,
	descr: PropertyDescriptor
): PossiblyProxy {
	const success = reflectDefinePropertyPolyfill(object, key, descr)
	if (!success) {
		throw new TypeError(
			`'defineProperty' on proxy: trap returned falsish for property '${safeToString(
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
	return getNativeApi(getObject, 'defineProperties')(object, descs)
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
	return getNativeApi(getObject, 'getOwnPropertyDescriptor')(object, key)
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
				throw new TypeError(`${safeToString(key)} is not a valid property name`)
			}
		}
		return validKeys
	}
	return getNativeApi(getReflect, 'ownKeys')(api.target)
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
	return getNativeApi(getObject, 'keys')(object as {})
}

const getOwnPropertyNamesPolyfill = function getOwnPropertyNames(
	object: PossiblyProxy
) {
	const api = getProxyfillApi(object)
	if (api) {
		return getOwnKeysFromProxy(api, isString, object)
	}
	return getNativeApi(getObject, 'getOwnPropertyNames')(object)
}

const getOwnPropertySymbolsPolyfill = function getOwnPropertyNames(
	object: PossiblyProxy
) {
	const api = getProxyfillApi(object)
	if (api) {
		return getOwnKeysFromProxy(api, isSymbol, object)
	}
	return getNativeApi(getObject, 'getOwnPropertyNames')(object)
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
		return getNativeApi(getObject, 'assign')(target, source)
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

function getPolyfillForNativeMethod(
	object: unknown,
	methodName: string | symbol
): undefined | Function {
	if (!object) {
		return
	}

	if (object === getObject()) {
		switch (methodName) {
			case 'defineProperty':
				return objectDefinePropertyPolyfill
			case 'defineProperties':
				return objectDefinePropertiesPolyfill
			case 'getOwnPropertyDescriptor':
				return getOwnPropertyDescriptorPolyfill
			case 'getOwnPropertyNames':
				return getOwnPropertyNamesPolyfill
			case 'getOwnPropertySymbols':
				return getOwnPropertySymbolsPolyfill
			case 'keys':
				return objectKeysPolyfill
			case 'assign':
				return assignPolyfill
		}
	} else if (object === getReflect()) {
		switch (methodName) {
			case 'defineProperty':
				return reflectDefinePropertyPolyfill
			case 'get':
				return get
			case 'set':
				return set
			case 'deleteProperty':
				return deleteProperty
		}
	}
}

function getPolyfillForFunction(
	originalFunction: unknown
): undefined | Function {
	if (!originalFunction) {
		return
	}
	if (originalFunction === Object$hasOwnProperty) {
		return hasOwnPropertyPolyfill
	}
	if (originalFunction === NativeProxy) {
		return ProxyPolyfill
	}
}

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

	const privateApi: ProxyfillPrivateApi = {
		target,
		handler,
		revoked: false,
		isFn: false,
		isArr: false,
	}

	let proxy: ProxyPrivateApiContainer
	if (typeof target === 'function') {
		privateApi.isFn = true
		proxy = function ProxyPolyfill(this: any) {
			const usingNew = !!this && this.constructor === proxy
			const args: any[] = slice.call(arguments)

			// since the target was a function, fallback to calling it directly.
			if (usingNew) {
				assertNotRevoked(proxy.__proxyfill, 'construct')
				if (handler.construct) {
					return handler.construct.call(this, target, args, proxy as any)
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
		} as any
	} else if (target instanceof Array) {
		privateApi.isArr = true
		proxy = [] as any
	} else {
		proxy = {} as any
	}

	const Object$getOwnPropertyNames = getNativeApi(
		getObject,
		'getOwnPropertyNames'
	)
	const propertyNames = Object$getOwnPropertyNames(target) || []
	const propertySymbols =
		getNativeApi(getObject, 'getOwnPropertySymbols')(target) || []
	const allOwnProperties = concat(propertyNames, propertySymbols)

	const Object$getOwnPropertyDescriptor = getNativeApi(
		getObject,
		'getOwnPropertyDescriptor'
	)

	// Set getter-setter traps to all of the properties of the target object.  This is done
	// only as a fallback in case something is wrong with the build process! All property
	// access in the application should've been converted to __proxyfillRuntime$get calls
	// and we should not need this at all, but sometimes some dependency or something
	// might've been missed from the build and that can cause some "regular" foo.bar access
	// to pass through. At that point we can't do perfect job polyfilling it (can't catch
	// new properties being added), but we'll try our best.

	if (privateApi.isArr) {
		// For arrays, we don't copy all the items because that could be very memory-heavy
		// for large arrays. Just copy a few and try to detect iteration. This is very
		// hacky and brittle, but it's the best we can do here. Again, this should not even
		// be needed, as all the [].map calls etc should've already been transformed to
		// __proxyfillRuntime$invoke([], 'map'). This is only a fallback.
		const arrayProto: any = Array.prototype
		const arrayProtoProps = Object$getOwnPropertyNames(arrayProto)
		for (let i = 0, n = arrayProtoProps.length; i < n; i++) {
			const prop = arrayProtoProps[i]
			if (prop === 'length' || prop === 'constructor') {
				continue
			}
			if (typeof arrayProto[prop] === 'function') {
				setArrayMethodTrap(proxy as ProxyPrivateApiContainer & Array<any>, prop)
			}
		}
	} else if (!privateApi.isFn) {
		for (let i = 0, n = allOwnProperties.length; i < n; i++) {
			const prop = allOwnProperties[i]
			const descr = Object$getOwnPropertyDescriptor(target, prop)
			setPropertyTrap(proxy, prop, descr, /* warn: */ true)
		}
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
	runtimeTraps = concat(runtimeTraps, ['valueOf', 'toString', 'toJSON'])

	for (let i = 0, n = runtimeTraps.length; i < n; i++) {
		const trap = runtimeTraps[i]
		if (includes(allOwnProperties, trap)) continue
		setPropertyTrap(proxy, trap, undefined, false)
	}

	const privateApiKey: keyof ProxyPrivateApiContainer = '__proxyfill'

	// Set the actual __proxyfill private api, which will be used by __proxyfillRuntime API
	getNativeApi(getObject, 'defineProperty')(proxy, privateApiKey, {
		writable: false,
		configurable: false,
		enumerable: false,
		value: privateApi,
	})

	return proxy
}

function logWarning(msg: string | Error) {
	if (typeof console !== 'undefined' && typeof console.warn === 'function') {
		console.warn(msg)
	}
}

function setPropertyTrap(
	proxy: PossiblyProxy,
	prop: string | symbol,
	descr: PropertyDescriptor | undefined,
	warn: boolean
) {
	const Object$defineProperty = getNativeApi(getObject, 'defineProperty')
	const attributes = {
		get: function mirroredGet() {
			return fallbackGet(proxy, prop, warn)
		},
		set: function mirroredSet(val: unknown) {
			return fallbackSet(proxy, prop, val, warn)
		},
		enumerable: !!(descr && descr.enumerable),
	}
	try {
		Object$defineProperty(proxy, prop, attributes)
	} catch (err) {
		logWarning('Cannot callDefineProperty for property ' + safeToString(prop))
	}
}

const MAX_ARRAY_ENTRY_TRAPS = 3

function updateMirroredArrayEntries(
	proxy: ProxyPrivateApiContainer & Array<any>
) {
	const api = getProxyfillApi(proxy)
	if (!api || !api.isArr) {
		// Sanity check, this shouldn't happen though
		return
	}
	const targetArr: any[] = api.target as any
	// Clear existing traps
	const targetLength = targetArr.length
	if (targetLength === proxy.length) {
		return
	}
	if (targetLength > proxy.length) {
		proxy.length = targetLength
	}
	const trapsToSet =
		targetLength > MAX_ARRAY_ENTRY_TRAPS ? MAX_ARRAY_ENTRY_TRAPS : targetLength
	for (let i = 0; i < trapsToSet; i++) {
		defineMirroredArrayEntry(proxy, targetArr, i)
	}
}

function defineMirroredArrayEntry(
	proxy: ProxyPrivateApiContainer & Array<any>,
	targetArr: any[],
	index: number
) {
	if (index < 0 || index >= targetArr.length) {
		return
	}

	const currentDescr = getNativeApi(getObject, 'getOwnPropertyDescriptor')(
		proxy,
		index
	)
	if (currentDescr) {
		// There already is trap for this index, skip
		return
	}
	const Object$defineProperty = getNativeApi(getObject, 'defineProperty')

	Object$defineProperty(proxy, '' + index, {
		configurable: true,
		enumerable: true,
		get: function mirroredArrayEntryGet() {
			const result = fallbackGet(proxy, index, /* warn: */ true)
			// We might be iterating the array, define next and previous entry if they are not there already so
			// that we trap that too
			defineMirroredArrayEntry(proxy, targetArr, index + 1)
			// Define index-1 too in case we are iterating backwards
			defineMirroredArrayEntry(proxy, targetArr, index - 1)
			return result
		},
		set(value: any) {
			return fallbackSet(proxy, index, value, true)
		},
	})
}

function setArrayMethodTrap(
	proxy: ProxyPrivateApiContainer & Array<any>,
	prop: string | symbol
) {
	const Object$defineProperty = getNativeApi(getObject, 'defineProperty')

	Object$defineProperty(proxy, prop, {
		writable: true,
		enumerable: false,
		configurable: true,
		value: function mirroredArrayMethod(...args: any[]) {
			const result = invoke(proxy, prop, args)
			updateMirroredArrayEntries(proxy)
			return result
		},
	})
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

export function get(obj: PossiblyProxy, property: unknown): unknown {
	const propName = normalizeProperty(property)

	// Some standard lib functions, like {}.hasOwnPrototype, defineProperty, etc
	// need special handling to make some Proxy traps work correctly.
	let trappedNativeFn = getPolyfillForNativeMethod(obj, propName)
	if (trappedNativeFn) return trappedNativeFn

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

	trappedNativeFn = getPolyfillForFunction(val)
	if (trappedNativeFn) return trappedNativeFn

	return val
}

function fallbackGet(
	obj: PossiblyProxy,
	property: unknown,
	warn: boolean
): unknown {
	// This function is called if, for some reason, some part of the end result application
	// ends up doing `proxy.foo = bar` directly, at which point something has already failed
	// because all of those statements should've been transformed to _proxyfillRuntime$get calls.

	if (
		warn &&
		typeof console !== 'undefined' &&
		typeof console.warn === 'function'
	) {
		console.warn(
			new Error(
				`Getter ${safeToString(
					property
				)} called directly without going through _proxyfillRuntime$get`
			)
		)
	}
	return get(obj, property)
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
					`'set' on proxy: trap returned falsish for property '${safeToString(
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

function fallbackSet(
	obj: PossiblyProxy,
	property: unknown,
	value: unknown,
	warn: boolean
): unknown {
	// This function is called if, for some reason, some part of the end result application
	// ends up doing `proxy.foo = bar` directly, at which point something has already failed
	// because all of those statements should've been transformed to _proxyfillRuntime$set calls.

	if (
		warn &&
		typeof console !== 'undefined' &&
		typeof console.warn === 'function'
	) {
		console.warn(
			new Error(
				`Getter ${safeToString(
					property
				)} called directly without going through _proxyfillRuntime$set`
			)
		)
	}
	return set(obj, property, value)
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
	/* Proxy polyfill by library proxyfill */

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

export {ProxyPolyfill as Proxy}
