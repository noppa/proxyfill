import * as proxyfill from './index'
import getGlobal from './getGlobal'

const context = getGlobal()

context.Proxy = proxyfill.Proxy
context.proxyfill$get = proxyfill.get
context.proxyfill$set = proxyfill.set
context.proxyfill$invoke = proxyfill.invoke
