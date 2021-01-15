import {Proxy, get, set, invoke} from '../src/runtime'

describe('proxyfill runtime', () => {
	describe('getters', () => {
		it('should call the getter trap function', () => {
			const obj = {foo: 1}
			// "custom" implementation of jest.fn used here
			// because Jest seems to flip out trying to spread
			// the proxy-argument that has Symbol.iterator installed.
			let calledTimes = 0,
				args: any[]
			const handlers = {
				get(..._args: any[]) {
					calledTimes++
					args = _args
					return 42
				},
			}
			const proxy = new Proxy(obj, handlers)
			expect(get(proxy, 'foo')).toBe(42)
			expect(calledTimes).toBe(1)
			expect(args).toEqual([obj, 'foo', expect.any(Object)])
			expect(args[2]).toBe(proxy)
		})

		it('should stringify non-symbol properties', () => {
			const obj = {foo: 1}
			let args: any[]
			const handlers = {
				get(..._args: any[]) {
					args = _args
					return 42
				},
			}
			const proxy = new Proxy(obj, handlers)
			expect(get(proxy, Symbol.for('foo'))).toBe(42)
			expect(args).toEqual([obj, Symbol.for('foo'), expect.any(Object)])

			expect(get(proxy, 24)).toBe(42)
			expect(args).toEqual([obj, '24', expect.any(Object)])
		})
	})
})
