(function () {
    'use strict';

    /* eslint-disable @typescript-eslint/ban-types */
    const privateApiKey = '__proxyfill';

    function assertNotPrivateApiProp(property) {
        if (property === privateApiKey) {
            throw new Error('Cannot access private API of proxyfill library');
        }
    }

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
    function isObject(val) {
        if (!val)
            return false;
        const t = typeof val;
        return t === 'object' || t === 'function';
    }
    const { bind, apply } = isObject;
    const { slice } = [];
    const { assign, defineProperty } = Object;
    const shallowClone = (obj) => assign({}, obj);
    function createProxy(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    handler) {
        if (!isObject(target) || !isObject(handler)) {
            throw new TypeError('Cannot create proxy with a non-object as target or handler');
        }
        const proxyPrivateApi = {
            __proxyfill: {
                target,
                handler: shallowClone(handler),
                revoked: false,
            },
        };
        let proxy;
        if (typeof target === 'function') {
            proxy = function ProxyPolyfill() {
                const usingNew = !!this && this.constructor === proxy;
                const args = slice.call(arguments);
                if (usingNew && handler.construct) {
                    return handler.construct.call(this, target, args);
                }
                else if (!usingNew && handler.apply) {
                    return handler.apply(target, this, args);
                }
                // since the target was a function, fallback to calling it directly.
                if (usingNew) {
                    // inspired by answers to https://stackoverflow.com/q/1606797
                    args.unshift(target);
                    const ProxyTargetConstructor = bind.apply(target, args);
                    return new ProxyTargetConstructor();
                }
                return target.apply(this, args);
            };
            assign.call(proxy, proxyPrivateApi);
        }
        else if (target instanceof Array) {
            proxy = [];
            assign.call(proxy, proxyPrivateApi);
        }
        else {
            proxy = proxyPrivateApi;
        }
        // Install top-level getter traps for symbols & methods
        // that the ES runtime might call automatically, for example
        // to convert the value to a number with `+foo`.
        let runtimeTraps;
        const _Symbol = typeof Symbol !== 'undefined' && Symbol;
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
            ].filter(Boolean);
        }
        else {
            runtimeTraps = [];
        }
        runtimeTraps.push('valueOf', 'toString');
        for (let i = 0; i < runtimeTraps.length; i++) {
            const trap = runtimeTraps[i];
            defineProperty(proxy, trap, {
                get: () => get(proxy, trap),
            });
        }
        return proxy;
    }
    function getProxyfillApi(obj) {
        const type = typeof obj;
        return ((((type === 'object' && obj !== null) || type === 'function') &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            obj.__proxyfill) ||
            null);
    }
    function assertNotRevoked(api, op) {
        if (api.revoked) {
            throw new Error(`Cannot perform ${op} on a proxy that has been revoked`);
        }
    }
    function normalizeProperty(propertyName) {
        const t = typeof propertyName;
        if (t === 'string' || t === 'symbol') {
            assertNotPrivateApiProp(propertyName);
            return propertyName;
        }
        return String(propertyName);
    }
    /**
     *
     * @param obj Target object to get a value from, possibly a "Proxy" created with createProxy.
     * @param propName Name of the property to get
     * @param notProxy Result of calling isNotProxy(obj) that can be used as an optimization
     * 		to skip the proxy check in places where properties of a constant object are accessed
     * 		multiple times.
     */
    function get(obj, property) {
        // NOTE: Stringifying obj here, by using console.log, for example, can cause
        // inifinite loop because the proxy has Symbol.toPrimitive trap set to call
        // this function again.
        const propName = normalizeProperty(property);
        const api = getProxyfillApi(obj);
        if (api) {
            assertNotRevoked(api, 'get');
            const handlers = api.handler;
            const getHandler = handlers.get;
            if (getHandler) {
                return getHandler.call(handlers, api.target, propName, obj);
            }
            obj = api.target;
        }
        return obj[propName];
    }
    function invoke(obj, property, args) {
        const fn = get(obj, property);
        if (typeof fn !== 'function') {
            throw new TypeError(`${String(property)} is not a function`);
        }
        return apply.call(fn, obj, args);
    }
    function set(obj, property, value) {
        const propName = normalizeProperty(property);
        const api = getProxyfillApi(obj);
        if (api) {
            assertNotRevoked(api, 'set');
            const handlers = api.handler;
            const setHandler = handlers.set;
            if (setHandler) {
                const result = setHandler.call(handlers, api.target, propName, value, obj);
                if (!result) {
                    // Assume strict mode and throw for failed assignment
                    throw new TypeError(`'set' on proxy: trap returned falsish for property '${String(propName)}'`);
                }
                return value;
            }
            obj = api.target;
        }
        return (obj[propName] = value);
    }
    const Proxy = function Proxy(target, handler) {
        const isCalledWithNew = !!this && this instanceof Proxy;
        if (!isCalledWithNew) {
            throw new TypeError("Constructor Proxy requires 'new'");
        }
        return createProxy(target, handler);
    };
    Proxy.revocable = function (target, handler) {
        const proxy = createProxy(target, handler);
        function revoke() {
            proxy.__proxyfill.revoked = true;
        }
        return { proxy, revoke };
    };

    function getGlobal() {
        if (typeof globalThis !== 'undefined') {
            return globalThis;
        }
        if (typeof this !== 'undefined') {
            return this;
        }
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window !== 'undefined') {
            return window;
        }
        if (typeof global !== 'undefined') {
            return global;
        }
        throw new Error('unable to locate global object');
    }

    const context = getGlobal();
    context.Proxy = Proxy;
    context.proxyfill$get = get;
    context.proxyfill$set = set;
    context.proxyfill$invoke = invoke;

}());
