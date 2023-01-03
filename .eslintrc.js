const currentDir = __dirname || '.'

module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2022,
		tsConfigRootDir: __dirname,
		project: [
			`${currentDir}/tsconfig.cjs.json`,
			`${currentDir}/tsconfig.tests.json`,
		],
	},
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:node/recommended-module',
		"plugin:prettier/recommended",
	],
	rules: {
		'node/no-missing-import': [
			'error',
			{
				resolvePaths: [
					`${currentDir}/src`,
					`${currentDir}/node_modules`,
					`${currentDir}/node_modules/@types`,
					`${currentDir}/node_modules/@types/node`,
				],
				tryExtensions: ['.cts', '.mts', '.ts', '.d.ts'],
			},
		],
		'one-var': ['error', 'never'],
		quotes: ['error', 'single', { avoidEscape: true }],
		'sort-imports': 'error',
	},
	ignorePatterns: ['.eslintrc.js', 'astro.config.mjs', 'artifacts'],
	overrides: [],
}
