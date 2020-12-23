// import { createParamDecorator } from "../..";
// import { Api, DataLoader } from "../../..";
// import { ClassType } from "../../src";

// export type DataLoaderParam = (id: string) => ReturnType<DataLoader<any, any, any>['load']>

// // export function Dataloader<
// //     TEntityRelation,
// //     >(keyDataloader: Function | string, relationKey: keyof TEntityRelation) {
// //     return createParamDecorator(
// //         ({ context }) => {
// //             const { dataloaders, db } = context as Api.Context

// //             return (id: any) => {
// //                 if (!dataloaders.has(keyDataloader))
// //                     dataloaders.set(
// //                         keyDataloader,
// //                         new DataLoader(
// //                             async ids => {
// //                                 const childDocs = await db.find(keyDataloader, { $and: [{ [relationKey]: { $in: ids } }] })
// //                                 const map = {}
// //                                 for (let index = 0; index < childDocs.length; index++) {
// //                                     let childDoc = childDocs[index]
// //                                     map[
// //                                         childDoc[relationKey]
// //                                     ] = childDoc
// //                                 }
// //                                 return ids.map(key => map[key] || [])
// //                             }
// //                         )
// //                     )

// //                 return dataloaders.get(keyDataloader).load(id)
// //             }
// //             // return dataloaders.get(keyDataloader).load(parentData[parentRelationKey])
// //         })
// // }