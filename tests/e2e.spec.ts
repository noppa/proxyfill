import traverse from './traverse'
import vm from 'vm'
import * as proxyfillRuntime from '../src/runtime'

describe('runtime behavior of generated code', () => {
	function mkTest<ResultType>(
		expectedResult: ResultType,
		testCode: () => ResultType
	) {
		function runTest() {
			function requireFromScript(moduleName: string) {
				if (moduleName === 'proxyfill/runtime') {
					return proxyfillRuntime
				}
				throw new Error('Unknown module ' + moduleName)
			}
			const result = {
				value: undefined,
			}
			const rawSource = `RESULT.value = (${testCode.toString()})();`
			const transpiledSource = traverse(rawSource, {
				importStyle: 'commonjs',
			})
			console.log(testCode.name + ': ' + transpiledSource)
			new Function('require', 'RESULT', transpiledSource)(
				requireFromScript,
				result
			)
			expect(result.value).toEqual(expectedResult)
		}
		return runTest
	}

	describe('meta tests for e2e', () => {
		// Sanity check that our test setup works
		it(
			'should compile the provided function correctly',
			mkTest(
				[
					`function getOwnSource() {`,
					`    const res = _proxyfillRuntime$invoke(getOwnSource, 'toString', [])`,
					``,
					`    return res`,
					`}`,
				].join('\n'),
				function getOwnSource() {
					const res = getOwnSource.toString()
					return res
				}
			)
		)
	})

	describe('basic functionality', () => {
		it(
			'should call proxy to get property',
			mkTest('aa', () => {
				const obj = {foo: 'b'}
				const proxy: any = new Proxy(obj, {
					get() {
						return 'a'
					},
				})
				return proxy.foo + proxy.bar
			})
		)
	})

	describe('polyfilled built-in functions', () => {
		it(
			'should go through Proxy when calling Object.assign',
			mkTest({foo: 3, bar: 4} as {foo: number; bar?: number}, () => {
				const obj = {foo: 1}
				const proxy = new Proxy(obj, {
					set(target, key, value) {
						target[key] = value + 1
						return true
					},
				})
				Object.assign(proxy, {foo: 2, bar: 3})
				return obj
			})
		)
		it(
			'should go through Proxy when calling hasOwnProperty',
			mkTest({called: true, hasFoo: false, hasBar: true}, () => {
				const obj = {foo: 1}
				let called = false
				const proxy: any = new Proxy(obj, {
					getOwnPropertyDescriptor(target, key) {
						called = true
						// "lie" that the shape of the object is {bar: 1}
						return key === 'bar'
							? {
									value: 1,
									writable: true,
									enumerable: true,
									configurable: true,
							  }
							: undefined
					},
				})
				const hasFoo = proxy.hasOwnProperty('foo')
				const hasBar = proxy.hasOwnProperty('bar')
				return {called, hasFoo, hasBar}
			})
		)
	})
})
