export default function getGlobal(this: any): typeof globalThis {
	if (typeof globalThis !== 'undefined') {
		return globalThis
	}
	if (typeof this !== 'undefined') {
		return this
	}
	if (typeof self !== 'undefined') {
		return self
	}
	if (typeof window !== 'undefined') {
		return window
	}
	if (typeof global !== 'undefined') {
		return global
	}
	throw new Error('unable to locate global object')
}
