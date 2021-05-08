import traverse from './traverse'
import vm from 'vm'
import * as proxyfillRuntime from '../src/runtime'

describe('runtime behavior of generated code', () => {
	function mkTest<ResultType>(
		expectedResult: ResultType,
		testCode: () => ResultType
	) {
		function runTest() {
			const context = {
				RESULT: undefined,
				require(moduleName: string) {
					if (moduleName === 'proxyfill/runtime') {
						return proxyfillRuntime
					}
					throw new Error('Unknown module ' + moduleName)
				},
			}
			const rawSource = `RESULT = (${testCode.toString()})();`
			const transpiledSource = traverse(rawSource, {
				importStyle: 'commonjs',
			})
			console.log(testCode.name + ': ' + transpiledSource)
			vm.createContext(context)
			const script = new vm.Script(transpiledSource)
			script.runInContext(context)
			expect(context.RESULT).toEqual(expectedResult)
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
})
