module.exports = {
	'env': {
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'prettier/@typescript-eslint',
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 12,
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	"rules": {
		"@typescript-eslint/explicit-module-boundary-types": 0,
		"@typescript-eslint/no-explicit-any": 0
	}
}
