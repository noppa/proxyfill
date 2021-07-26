import traverse from './traverse'
import * as proxyfillRuntime from '../src/runtime'

describe('runtime behavior of generated code', () => {
	function mkTest<ResultType>(
		expectedResult: ResultType,
		testCode: () => ResultType,
		options?: {disableNativeProxyCheck?: boolean}
	) {
		function runTest() {
			function requireFromScript(moduleName: string) {
				if (moduleName.startsWith('proxyfill/runtime')) {
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
			try {
				new Function('require', 'RESULT', transpiledSource)(
					requireFromScript,
					result
				)
			} catch (err) {
				console.warn(
					[
						JSON.stringify(err && err.message),
						'Note: The second argument to mkTest gets evaluated with new Function' +
							', so any references to outside JavaScript may throw for being out of scope',
					].join('\n')
				)
				throw err
			}
			expect(result.value).toEqual(expectedResult)
			if (!options?.disableNativeProxyCheck) {
				// As a sanity check, also run the test with actual Proxy to make
				// sure the test expectation is correct.
				const nativeResult = {
					value: undefined,
				}
				new Function('RESULT', rawSource)(nativeResult)
				expect(nativeResult.value).toEqual(expectedResult)
			}
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
					`\t\tconst res = _proxyfillRuntime$invoke(getOwnSource, 'toString', [])`,
					``,
					`\t\treturn res`,
					`\t}`,
				].join('\n'),
				function getOwnSource() {
					const res = getOwnSource.toString()
					return res
				},
				{disableNativeProxyCheck: true}
			)
		)
	})
	describe('basic functionality', () => {
		it(
			'should call "get" trap to get property',
			mkTest(['a', 'a', 2], () => {
				let calls = 0
				const proxy: any = new Proxy(
					{foo: 'b'},
					{
						get() {
							calls++
							return 'a'
						},
					}
				)
				return [proxy.foo, proxy.bar, calls]
			})
		)
		it(
			'should call "has" trap for in-operator',
			mkTest([false, true, 2, true], () => {
				let calls = 0
				const obj = {foo: 1}
				let _target: null | typeof obj = null
				const proxy: any = new Proxy(obj, {
					has(target, string) {
						calls++
						_target = target
						return string === 'baz'
					},
				})
				return ['foo' in proxy, 'baz' in proxy, calls, _target === obj]
			})
		)
		it(
			'should call "deleteProperty" trap for delete-operator',
			mkTest([true, false, 1], () => {
				let calls = 0
				const obj = {foo: 1 as undefined | number}
				const proxy: any = new Proxy(obj, {
					deleteProperty(target: any, key) {
						calls++
						delete target[key]
						return true
					},
				})
				const result = delete proxy.foo
				return [result, 'foo' in obj, calls]
			})
		)
	})
	describe('polyfilled built-in functions', () => {
		it(
			'should go through Proxy when calling Object.assign',
			mkTest({foo: 3, bar: 4} as {foo: number; bar?: number}, () => {
				const obj = {foo: 1}
				const proxy = new Proxy(obj, {
					set(target: any, key, value) {
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
		it(
			'should pass Array.isArray check',
			mkTest(true, () => {
				return Array.isArray(new Proxy([], {}))
			})
		)
		it(
			'should call polyfilled Object.keys',
			mkTest(['foo'], () => {
				const p = new Proxy(
					{},
					{
						ownKeys() {
							return ['foo', 'bar', Symbol('baz')]
						},
						getOwnPropertyDescriptor(target, key: string | symbol) {
							return {
								enumerable: key !== 'bar',
								configurable: true,
							}
						},
					}
				)
				return Object.keys(p)
			})
		)
	})
})
