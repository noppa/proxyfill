// This file contains some array utilities that are similar to their native counterparts
// like Array.prototype.concat, although not as spec-compatible since these utilities are
// intended to only be used for internal values that we know to be normal arrays without
// Symbol.isConcatSpreadable trickery or whatever.  We use these instead of the native
// counterparts to avoid calling to possible polyfills like core-js, which could be
// decorated with proxyfill and could then lead to infinite loops and such problems.

export function concat<A, B>(
	arr1: readonly A[],
	arr2: readonly B[]
): Array<A | B> {
	const result: Array<A | B> = []
	const arr1Length = arr1.length
	for (let i = 0, n = arr1Length; i < n; i++) {
		result[i] = arr1[i]
	}
	for (let i = 0, n = arr2.length; i < n; i++) {
		result[arr1Length + i] = arr2[i]
	}
	return result
}

export function indexOf<T>(haystack: readonly T[], needle: T): number {
	for (let i = 0, n = haystack.length; i < n; i++) {
		if (haystack[i] === needle) {
			return i
		}
	}
	return -1
}

export function includes<T>(haystack: readonly T[], needle: T): boolean {
	return indexOf(haystack, needle) !== -1
}
