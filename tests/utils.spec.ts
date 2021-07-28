import * as A from '../src/utils/arrayHelpers'

describe('array utilities', () => {
	describe('concat', () => {
		it('should combine two arrays into one array', () => {
			expect(A.concat([1, 3], [2, 4, 5])).toEqual([1, 3, 2, 4, 5])
			expect(A.concat([], [2, 4])).toEqual([2, 4])
		})
	})
	describe('indexOf', () => {
		it('should find the index of a value', () => {
			expect(A.indexOf([1, 2, 3], 2)).toBe(1)
		})
		it('should return -1 if the index is not found', () => {
			expect(A.indexOf<number | string>([1, 2, 3], '2')).toBe(-1)
		})
	})
})
