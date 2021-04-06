import {Proxy, get, set, invoke} from '../src/runtime'

describe('proxyfill runtime', () => {
	describe('calling handlers with correct arguments', () => {
		it('should stringify non-symbol properties for getter', () => {
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
			expect(args[2]).toBe(proxy)

			expect(get(proxy, 24)).toBe(42)
			expect(args).toEqual([obj, '24', expect.any(Object)])
		})

		it('should stringify non-symbol properties for setter', () => {
			const obj = {foo: 1}
			let args: any[]
			const handlers = {
				set(..._args: any[]) {
					args = _args
					return true
				},
			}
			const proxy = new Proxy(obj, handlers)
			expect(set(proxy, Symbol.for('foo'), 32)).toBe(32)
			expect(args).toEqual([
				obj,
				Symbol.for('foo'),
				32,
				expect.any(Object),
			])
			expect(args[3]).toBe(proxy)

			expect(set(proxy, 24, 52)).toBe(52)
			expect(args).toEqual([obj, '24', 52, expect.any(Object)])
		})
	})

	describe('Revocable proxy', () => {
		it('should throw if function Proxy applied after it is revoked', () => {
			const p = Proxy.revocable(function () {}, {
				apply() {
					return 42
				},
			})
			expect(invoke(p, 'proxy', [])).toBe(42)
			expect(invoke(p, 'revoke', [])).toBeUndefined()
			expect(() => invoke(p, 'proxy', [])).toThrowError(TypeError)
		})
	})
})
