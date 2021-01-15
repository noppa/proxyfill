import {Proxy, get, set, invoke} from '../src/runtime'

describe('proxyfill runtime', () => {
	let bPrivateApi: any, proxyBase: any
	beforeEach(() => {
		bPrivateApi = {
			_setB: function (self: any, val: number) {
				self._b = val
			},
			_getB: function (self: any) {
				return self._b
			},
		}
		proxyBase = {
			a: 42,
			foo: function () {
				return this
			},

			_b: 1,

			get b() {
				return bPrivateApi._getB(this)
			},
			set b(val) {
				bPrivateApi._setB(this, val)
			},
		}

		spyOn(proxyBase, 'foo').and.callThrough()
		spyOn(bPrivateApi, '_getB').and.callThrough()
		spyOn(bPrivateApi, '_setB').and.callThrough()
	})
	function runBasicGetterTests(obj: any, original = proxyBase) {
		expect(get(obj, 'a')).toBe(42)
		expect(get(obj, 'foo')).toBe(original.foo)

		expect(invoke(obj, 'foo', ['bar', 'baz'])).toBe(obj)
		expect(original.foo).toHaveBeenCalledTimes(1)
		expect(original.foo).toHaveBeenLastCalledWith('bar', 'baz')
		expect(set(obj, 'a', 24)).toBe(24)
		expect(get(obj, 'a')).toBe(24)
		expect(original.a).toBe(24)

		expect(get(obj, 'b')).toBe(1)
		expect(bPrivateApi._getB).toHaveBeenCalledTimes(1)
		expect(bPrivateApi._getB).toHaveBeenLastCalledWith(original)
		expect(set(obj, 'b', 2)).toBe(2)
		expect(bPrivateApi._getB).toHaveBeenCalledTimes(1)
		expect(bPrivateApi._setB).toHaveBeenCalledTimes(1)
		expect(bPrivateApi._setB).toHaveBeenLastCalledWith(original, 2)
		expect(original._b).toBe(2)
		expect(get(obj, 'b')).toBe(2)
		expect(bPrivateApi._getB).toHaveBeenCalledTimes(2)
	}
	it('should work normally for normal non-proxy objects', () => {
		runBasicGetterTests(proxyBase)
	})
	it('should work normally for non-proxy objects with prototype', () => {
		const inherited = Object.create(proxyBase)
		runBasicGetterTests(inherited, inherited)
	})
	it('should work normally for Proxy that has no traps', () => {
		runBasicGetterTests(new Proxy(proxyBase, {}))
	})
})
