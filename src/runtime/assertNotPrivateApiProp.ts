import {privateApiKey} from './constants'

export function assertNotPrivateApiProp(property: unknown) {
	if (property === privateApiKey) {
		throw new Error('Cannot access private API of proxyfill library')
	}
}
