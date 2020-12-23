import { Orm } from ".";
import { Service } from "../ioc";
import { DataLoader as DataLoaderSrc, BatchLoadFn, Options, } from "../dataloader/src";
import { Ioc } from "..";
import { ClassTypesWithScalars } from "../scalars/CustomScalar.abstract";

export type TDataLoader = DataLoaderSrc<any, any, any>

@Service()
export class DataLoader {
    constructor(
        private orm: Orm
    ) { }
    store = new Map<Function | string, DataLoaderSrc<any, any, any>>()
    createDataLoader<TValue>(id: Function | string, batchLoadFn: BatchLoadFn<any, any>, options?: Options<any, any, any>) {
        const newDataloader = new DataLoaderSrc<any, TValue, any>(batchLoadFn, options)
        this.store.set(id, newDataloader)
        return newDataloader
    }

    getDataLoaderEntity<TEntity extends Function>(Entity: TEntity, primaryKey?: keyof TEntity['prototype']) {
        if (this.store.has(Entity))
            return this.store.get(Entity)
        const pk = primaryKey || this.orm.EntityManager(Entity as any).em().getMetadata().get(Entity.name)[0]
        return this.createDataLoader<TEntity['prototype']>(
            Entity,
            async ids => {
                const childDocs = await this.orm.EntityManager(Entity as any).find({ $and: [{ [pk]: { $in: ids } }] })
                const map = {}
                for (let index = 0; index < childDocs.length; index++) {
                    let childDoc = childDocs[index]
                    map[
                        childDoc[pk as string]
                    ] = childDoc
                }
                return ids.map(key => map[key] || [])
            }
        )
    }
    // createDataLoaderEntity<TEntity extends Function>(Entity: TEntity, primaryKey?: keyof TEntity['prototype']) {
    //     const pk = primaryKey || this.orm.EntityManager(Entity as any).em().getMetadata().get(Entity.name)[0]
    //     console.log({ pk })
    //     return this.createDataLoader(
    //         Entity,
    //         async ids => {
    //             const childDocs = await this.orm.EntityManager(Entity as any).find({ $and: [{ [pk]: { $in: ids } }] })
    //             const map = {}
    //             for (let index = 0; index < childDocs.length; index++) {
    //                 let childDoc = childDocs[index]
    //                 map[
    //                     childDoc[pk as string]
    //                 ] = childDoc
    //             }
    //             return ids.map(key => map[key] || [])
    //         }
    //     )
    // }
    // static injectDataLoaderEntity<TEntity extends Function>(Entity: () => TEntity, primaryKey?: keyof TEntity['prototype']) {
    //     return function (object: Object, propertyName: string, index?: number) {
    //         Ioc.Container.registerHandler({
    //             object, propertyName, index, value: containerInstance => {
    //                 const entity = Entity()
    //                 const dataLoader = containerInstance.get(DataLoader)
    //                 if (dataLoader.store.has(entity))
    //                     return dataLoader.store.get(entity)
    //                 console.log('dddddddddd')
    //                 return dataLoader.createDataLoaderEntity(entity)
    //             }
    //         })
    //     };
    // }

    // batchFxFieldResolver<TEntity extends Function>(Entity: TEntity, relationKey: keyof TEntity['prototype']) {
    //     return async ids => {
    //         console.log({ ids })
    //         const childDocs = await this.orm.EntityManager(Entity as any).find({ $and: [{ [relationKey]: { $in: ids } }] })
    //         const map = {}
    //         for (let index = 0; index < childDocs.length; index++) {
    //             let childDoc = childDocs[index]
    //             map[
    //                 childDoc[relationKey as string]
    //             ] = childDoc
    //         }
    //         return ids.map(key => map[key] || [])
    //     }
    // }
}