import {Proxy, get, set, invoke, PossiblyProxy} from '../src/runtime'

describe('proxyfill runtime', () => {
	it('should work normally for normal non-proxy objects', () => {
		const bPrivateApi = {
			_setB: function (self: any, val: number) {
				self._b = val
			},
			_getB: function (self: any) {
				return self._b
			},
		}
		const obj: PossiblyProxy = {
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
		spyOn(obj, 'foo').and.callThrough()
		spyOn(bPrivateApi, '_getB').and.callThrough()
		spyOn(bPrivateApi, '_setB').and.callThrough()

		expect(get(obj, 'a')).toBe(42)
		expect(get(obj, 'foo')).toBe(obj.foo)

		expect(invoke(obj, 'foo', ['bar', 'baz'])).toBe(obj)
		expect(obj.foo).toHaveBeenCalledTimes(1)
		expect(obj.foo).toHaveBeenLastCalledWith('bar', 'baz')
		expect(set(obj, 'a', 24)).toBe(24)
		expect(get(obj, 'a')).toBe(24)
		expect(obj.a).toBe(24)

		expect(get(obj, 'b')).toBe(1)
		expect(bPrivateApi._getB).toHaveBeenCalledTimes(1)
		expect(bPrivateApi._getB).toHaveBeenLastCalledWith(obj)
		expect(set(obj, 'b', 2)).toBe(2)
		expect(bPrivateApi._getB).toHaveBeenCalledTimes(1)
		expect(bPrivateApi._setB).toHaveBeenCalledTimes(1)
		expect(bPrivateApi._setB).toHaveBeenLastCalledWith(obj, 2)
		expect(obj._b).toBe(2)
		expect(get(obj, 'b')).toBe(2)
		expect(bPrivateApi._getB).toHaveBeenCalledTimes(2)
	})
})
