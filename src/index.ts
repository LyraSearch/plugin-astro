// eslint-disable-next-line node/no-missing-import
import type { AstroConfig, AstroIntegration, RouteData } from 'astro'
import type {
	InsertConfig,
	Lyra,
	PropertiesSchema,
	SearchParams,
} from '@lyrasearch/lyra'
import {
	create as createLyraDB,
	insert as insertIntoLyraDB,
	save as saveLyraDB,
} from '@lyrasearch/lyra'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { compile } from 'html-to-text'
import { join as joinPath } from 'node:path'

export const defaultSchema: PropertiesSchema = {
	path: 'string',
	title: 'string',
	h1: 'string',
	content: 'string',
}

export type PageIndexSchema = typeof defaultSchema

export type LyraOptions = Partial<InsertConfig> & {
	/**
	 * Controls whether generatedFilePath is filter
	 * using case sensitive or case insensitive comparison
	 * @default false
	 *
	 */
	caseSensitive?: boolean
	pathMatcher: RegExp
	contentSelectors?: string[]
	searchOptions?: Omit<SearchParams<PageIndexSchema>, 'term'> | undefined
}

const PKG_NAME = '@lyrasearch/plugin-astro'

const titleConverter = compile({
	baseElements: { selectors: ['title'] },
})
const h1Converter = compile({
	baseElements: { selectors: ['h1'] },
})

const prepareLyraDb = (
	dbConfig: LyraOptions,
	pages: { pathname: string }[],
	routes: RouteData[],
): Lyra<PageIndexSchema> => {
	const contentConverter = compile({
		baseElements: {
			selectors:
				dbConfig.contentSelectors && dbConfig.contentSelectors.length
					? dbConfig.contentSelectors
					: ['body'],
		},
	})

	// pathname is usually of the form `some/path/`, while `r.route` usually takes
	// the form `/some/path`. That's why we strip start & end slashes to compare.
	const pathsToBeIndexed = pages
		.filter(({ pathname }) => dbConfig.pathMatcher.test(pathname))
		.map(({ pathname }) => ({
			pathname,
			generatedFilePath: routes.filter((r) => {
				const route = r.route.replace(/(^\/|\/$)/g, '')
				const pathName = pathname.replace(/(^\/|\/$)/g, '')

				if (dbConfig.caseSensitive) {
					return route.toLowerCase() === pathName.toLowerCase()
				}

				return route === pathName
			})[0]?.distURL?.pathname,
		}))
		.filter(({ generatedFilePath }) => !!generatedFilePath) as {
		pathname: string
		generatedFilePath: string
	}[]

	const lyraDB = createLyraDB({
		schema: defaultSchema,
		...(dbConfig.language ? { defaultLanguage: dbConfig.language } : undefined),
	})

	for (const { pathname, generatedFilePath } of pathsToBeIndexed) {
		const htmlContent = readFileSync(generatedFilePath, { encoding: 'utf8' })

		const title = titleConverter(htmlContent) ?? ''
		const h1 = h1Converter(htmlContent) ?? ''
		const content = contentConverter(htmlContent)

		insertIntoLyraDB(
			lyraDB,
			{
				path: `/${pathname}`,
				title,
				h1,
				content,
			},
			dbConfig.language ? { language: dbConfig.language } : undefined,
		)
	}

	return lyraDB
}

export const createPlugin = (
	options: Record<string, LyraOptions>,
): AstroIntegration => {
	let config: AstroConfig
	return {
		name: PKG_NAME,
		hooks: {
			'astro:config:done': ({ config: cfg }) => {
				config = cfg
			},
			'astro:build:done': ({ pages, routes }) => {
				const assetsDir = joinPath(config.outDir.pathname, 'assets')
				if (!existsSync(assetsDir)) {
					mkdirSync(assetsDir)
				}

				for (const [dbName, dbConfig] of Object.entries(options)) {
					const namedDb = prepareLyraDb(dbConfig, pages, routes)

					writeFileSync(
						joinPath(assetsDir, `lyraDB_${dbName}.json`),
						JSON.stringify(saveLyraDB(namedDb)),
						{ encoding: 'utf8' },
					)
				}
			},
		},
	}
}

export default createPlugin
