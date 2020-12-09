/* eslint-disable @typescript-eslint/ban-types */

export type ProxyfillPrivateApi = {
	target: object
	handler: ProxyHandler<object>
	revoked: boolean
}
export type ProxyPrivateApiContainer = {
	__proxyfill: ProxyfillPrivateApi
}

export const privateApiKey: keyof ProxyPrivateApiContainer = '__proxyfill'
