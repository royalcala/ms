// import { path } from "ramda"
// import { ClassType, ResolverData2 } from "../../../api"

// import { getPrimaryKey } from "../../utils";

// export const castDocsToMap = (docs, primaryKey: string) => {
//     const mapDocs = new Map()
//     for (let index = 0; index < docs.length; index++) {
//         let doc = docs[index]
//         mapDocs.set(doc[primaryKey], doc)
//     }
//     return mapDocs
// }

// export const searchDocsInDB = async (
//     db: ResolverData2['context']['db'],
//     mapDocs: ReturnType<typeof castDocsToMap>,
//     Entity: ClassType,
//     primaryKey: string
// ) => {
//     const found = await db.find(Entity, [...mapDocs.keys()])
//     if (found.length === 0)
//         throw new Error("No one id found to update");
//     const mapFound = new Map()
//     for (let index = 0; index < found.length; index++) {
//         let foundDoc = found[index]
//         mapFound.set(foundDoc[primaryKey], foundDoc)
//     }
//     const idsNotFound: string[] = []
//     mapDocs.forEach(
//         (value, key) => {
//             if (!mapFound.has(key))
//                 idsNotFound.push(key)
//         }
//     )
//     if (idsNotFound.length > 0)
//         throw new Error('Error.The next ids have not found:' + JSON.stringify(idsNotFound))
//     return mapFound
// }

// export function FindAndPersistUpdate(Entity: ClassType, pathToDocs: string[]) {
//     const findToUpdate = async (data: ResolverData2, next) => {
//         const db = data.context.db
//         const primaryKey = getPrimaryKey(db, Entity)
//         const docs = path<object[]>(pathToDocs, data)
//         const mapDocs = castDocsToMap(docs, primaryKey)
//         const mapFound = await searchDocsInDB(db, mapDocs, Entity, primaryKey)

//         //persist docs
//         mapFound.forEach(
//             (value, key) => {
//                 //persist each document for later update in db
//                 db.assign(value, mapDocs.get(key))
//             }
//         )
//         return next()
//     }
//     return findToUpdate
// }