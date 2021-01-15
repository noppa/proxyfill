import {Proxy, set} from '../src/runtime'

describe('setter', () => {
	it('should return the input value if trap returned truty', () => {
		const proxy = new Proxy({}, {set: () => (1 as any) as boolean})
		expect(set(proxy, 'foo', 5)).toBe(5)
	})
	it('should throw TypeError if trap returned falsy', () => {
		const proxy = new Proxy({}, {set: () => ('' as any) as boolean})
		expect(() => set(proxy, 'foo', 5)).toThrow(TypeError)
	})
})
