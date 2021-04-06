import * as proxyfill from './index'
import getGlobal from './getGlobal'

const context: any = getGlobal()

context.Proxy = proxyfill.Proxy
context._proxyfillRuntime$get = proxyfill.get
context._proxyfillRuntime$set = proxyfill.set
context._proxyfillRuntime$invoke = proxyfill.invoke
