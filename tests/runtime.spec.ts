import {Proxy, get, set, invoke} from '../src/runtime'

describe('proxyfill runtime', () => {
	describe('constructing Proxy', () => {
		it('should require both constructor args to be objects', () => {
			const errorMsg =
				'Cannot create proxy with a non-object as target or handler'
			expect(() => new Proxy(42 as any, {})).toThrowError(errorMsg)
			expect(() => new (Proxy as any)({})).toThrowError(errorMsg)
			expect(() => new (Proxy as any)({}, null)).toThrowError(errorMsg)
			// Function is allowed in the target-argument
			expect(() => new Proxy(() => {}, {})).not.toThrow()
		})
	})
	describe('calling handlers with correct arguments', () => {
		it('should stringify non-symbol properties for getter', () => {
			const obj = {foo: 1}
			let args: null | any[] = null
			const handlers = {
				get(..._args: any[]) {
					args = _args
					return 42
				},
			}
			const proxy = new Proxy(obj, handlers)
			expect(get(proxy, Symbol.for('foo'))).toBe(42)
			expect(args).toEqual([obj, Symbol.for('foo'), expect.any(Object)])
			expect(args?.[2]).toBe(proxy)

			expect(get(proxy, 24)).toBe(42)
			expect(args).toEqual([obj, '24', expect.any(Object)])
		})

		it('should stringify non-symbol properties for setter', () => {
			const obj = {foo: 1}
			let args: null | any[] = null
			const handlers = {
				set(..._args: any[]) {
					args = _args
					return true
				},
			}
			const proxy = new Proxy(obj, handlers)
			expect(set(proxy, Symbol.for('foo'), 32)).toBe(32)
			expect(args).toEqual([obj, Symbol.for('foo'), 32, expect.any(Object)])
			expect(args?.[3]).toBe(proxy)

			expect(set(proxy, 24, 52)).toBe(52)
			expect(args).toEqual([obj, '24', 52, expect.any(Object)])
		})

		fit('should work with nested Proxies', () => {
			const proxy = new Proxy(
				new Proxy(
					{},
					{
						get() {
							return 42
						},
					}
				),
				{}
			)
			expect(get(proxy, 'foo')).toBe(42)
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

	describe('Interop with standard library functions', () => {
		it('should redefine Obejct.hasOwnProperty behaviour', () => {
			const expectedKey = Symbol('foo')
			const proxy = new Proxy(
				{},
				{
					getOwnPropertyDescriptor(
						target: any,
						key: string | symbol
					): undefined | PropertyDescriptor {
						if (key === expectedKey) {
							return {
								writable: false,
								enumerable: false,
								value: 'bar',
							}
						}
					},
				}
			)

			expect(invoke(proxy, 'hasOwnProperty', ['foo'])).toBe(false)
			expect(invoke(proxy, 'hasOwnProperty', [expectedKey])).toBe(true)
			expect(invoke({}, 'hasOwnProperty', [expectedKey])).toBe(false)
			expect((get({}, 'hasOwnProperty') as Function).call(proxy, 'foo')).toBe(
				false
			)
			expect(
				(get({}, 'hasOwnProperty') as Function).call(proxy, expectedKey)
			).toBe(true)
			expect(
				(get({}, 'hasOwnProperty') as Function).call({}, expectedKey)
			).toBe(false)
		})
	})
})
