import { Mutation, MutationResolverData } from "./Mutation.abstract"
import { Middleware } from "../../../../api/src/interfaces/Middleware"
import { ValidateInstance } from "../../../../validator"
import { path } from "ramda";
import { ClassType } from "../../../../api";
import { PATH_TO_DOCS, CastOneToMany, populate } from "./Mutation.Insert";
import { castDocsToMap, FindAndPersistUpdate, searchDocsInDB } from "../Update.findAndPersist";
import { getPrimaryKey } from "../../../utils";

export function CreateInstance(
    Entity: ClassType,
    pathToDocs: string[]
) {
    const createInstane = (data: MutationResolverData, next) => {
        const docs = path<object[]>(pathToDocs, data)
        for (let index = 0; index < docs.length; index++) {
            docs[index] = Object.assign(new Entity(), docs[index])
        }
        return next()
    }
    return createInstane
}



export abstract class Update extends Mutation {
    protected middlewares: Middleware[] = [
        CastOneToMany(PATH_TO_DOCS),
        (data: MutationResolverData, next) => CreateInstance(
            this.config.entity,
            PATH_TO_DOCS
        )(data, next),
        ValidateInstance(PATH_TO_DOCS),
        (data: MutationResolverData, next) => FindAndPersistUpdate(
            this.config.entity,
            PATH_TO_DOCS
        )(data, next)
    ]
}



export abstract class UpdateNested extends Mutation {
    abstract nestedPath: string[]
    middlewares: Middleware[] = [
        (data: MutationResolverData<any>, next) => this.init_instancesAndDefaults(data, next)
    ]
    async init_instancesAndDefaults(data: MutationResolverData<any>, next) {
        const Entity = this.config.entity
        const db = data.context.db
        let docs = data.args.docs
        let instances = []
        for (let index = 0; index < docs.length; index++) {
            const instance = Object.assign(
                new Entity(),
                {
                    ...this.config.defaultProps(
                        docs[index],
                        data,
                        index
                    ),
                }
            )
            instances.push(instance)
            populate(docs, index, instance, this.nestedPath)
        }
        const primaryKey = getPrimaryKey(db, Entity)
        const mapDocs = castDocsToMap(instances, primaryKey)
        const mapFound = await searchDocsInDB(db, mapDocs, Entity, primaryKey)

        //persist docs
        mapFound.forEach(
            (value, key) => {
                db.assign(value, mapDocs.get(key))
            }
        )
        return next()
    }
}