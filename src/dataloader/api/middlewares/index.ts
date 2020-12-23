// import { ClassType, MiddlewareInterface, NextFn } from "../../../api";
// import { InsertManyResolverData } from "../../../orm/api/decorators/InsertMany";
// import { Service } from "../../../ioc";
// import { DataLoader } from "../../src";
// // import { Service } from "../../../ioc";


// @Service()
// export class DataLoaders implements MiddlewareInterface {
//     // constructor(private readonly logger: Logger) { }
//     instancesDataLoader: Map<string, DataLoader<any, any>> = new Map()
//     async use(data: InsertManyResolverData, next: NextFn) {
//         // data.context.
//         // if (this.instancesDataLoader.has())
//         //     return next();
//     }
// }


// export function CreateDataLoader(Entity: () => ClassType) {
//     //decorator
//     return DataLoaders
//     // const dataloader = async (data: InsertManyResolverData, next) => {
//     //     new DataLoader(async (ids) => {
//     //         return db.find(entity, ids)
//     //     })

//     // }
//     // return dataloader
// }