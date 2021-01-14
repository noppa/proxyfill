import traverse from './traverse'

describe('proxyfill Babel plugin', () => {
	it('should transform getters', () => {
		expect(traverse('foo.bar')).toMatchSnapshot()
	})
	it('should transform computed getters', () => {
		expect(
			traverse(`
			foo[0]
			foo[bar]
			foo[bar.baz]
		`)
		).toMatchSnapshot()
	})
	it('should transform method calls', () => {
		expect(traverse('foo.bar()')).toMatchSnapshot()
	})
	it('should not transform direct function calls', () => {
		expect(traverse('bar()')).toMatchSnapshot()
	})
})
