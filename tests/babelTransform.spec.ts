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
	it('should transform setters', () => {
		expect(traverse('foo.bar = 42')).toMatchSnapshot()
	})
	it('should transform computed setters', () => {
		expect(
			traverse(`
			foo[0] = 42
			foo[bar] = 42
			foo[bar.baz] = 42
		`)
		).toMatchSnapshot()
	})
	it('should transform method calls', () => {
		expect(traverse('foo.bar()')).toMatchSnapshot()
	})
	it('should not transform direct function calls', () => {
		expect(traverse('bar()')).toMatchSnapshot()
	})
	it('should transform in operator usage', () => {
		expect(
			traverse(`
			foo in bar
			'foo' in bar
		`)
		).toMatchSnapshot()
	})
	it('should transform delete operator usage', () => {
		expect(traverse(`delete foo.bar`)).toMatchSnapshot()
	})
	it('should transform update member expressions', () => {
		expect(traverse('foo.bar++')).toMatchSnapshot()
	})
	it('should not transform module.exports', () => {
		expect(
			traverse(`
			module.exports = {}
			module.exports.foo = 42
		`)
		).toMatchSnapshot()
	})
	it('should only transform usage of require.resolve if require is a local binding', () => {
		expect(
			traverse(`
			require.resolve('foo')
			function foo() {
				const require = {}
				require.resolve('foo')
			}
		`)
		).toMatchSnapshot()
	})
})
