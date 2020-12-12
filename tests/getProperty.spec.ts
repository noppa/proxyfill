import traverse from './traverse'

describe('proxyfill Babel plugin', () => {
	it('should transform getters', () => {
		expect(traverse('foo.bar')).toMatchSnapshot()
	})
})
