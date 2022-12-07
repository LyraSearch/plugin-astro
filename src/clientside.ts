import type { Data, Lyra } from '@lyrasearch/lyra'
import { create as createLyraDB, load as loadLyraDB } from '@lyrasearch/lyra'

export type PageIndexSchema = {
	path: 'string'
	title: 'string'
	h1: 'string'
	content: 'string'
}

// TODO: Once we have `satisfies` keyword in TS 4.9, use it to check against
//       `PropertiesSchema`, and redefine `PageIndexSchema` with
//       `typeof defaultSchema`
export const defaultSchema: PageIndexSchema = {
	path: 'string',
	title: 'string',
	h1: 'string',
	content: 'string',
}

// "global/shared" registry
const dbs: Record<string, Lyra<PageIndexSchema>> = {}

export const getLyraDB = async (
	dbName: string,
): Promise<Lyra<PageIndexSchema>> => {
	if (dbName in dbs) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return dbs[dbName]!
	}

	const db = createLyraDB({ schema: defaultSchema, edge: true })

	const dbResponse = await fetch(`/assets/lyraDB_${dbName}.json`)
	const dbData = (await dbResponse.json()) as Data<PageIndexSchema>

	loadLyraDB(db, dbData)
	dbs[dbName] = db

	return db
}

export { search } from '@lyrasearch/lyra'
