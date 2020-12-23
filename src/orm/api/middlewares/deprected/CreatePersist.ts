import { path } from 'ramda'
import { Api } from '../../..'
import { ClassType } from '../../../api'
import { assocPath } from "ramda";
import { DefaultPropsFx, ResolverDataMutation } from './Mutation.abstract';
export function CreatePersist(Entity: ClassType, pathToDocs: string[]) {
    const persistInstance = (data: Api.ResolverData2, next) => {
        const docs = path<object[]>(pathToDocs, data)
        for (let index = 0; index < docs.length; index++) {
            docs[index] = Object.assign(new Entity(), docs[index])
        }
        data.context.db.persist(docs)
        return next()
    }
    return persistInstance
}

type ConfigNestedAndPopulate = {
    Entity: ClassType,
    pathToDocs: string[],
    nestedPath: string[],
    defaultPropsFx: DefaultPropsFx<any, any>
}
const getPopulateFx = (nestedPath: string[]) => {
    if (nestedPath.length === 1)
        return (doc, instance) => {
            Object.defineProperty(doc, nestedPath[0], {
                enumerable: true,
                value: instance
            })
        }
    else {
        const firstKey = nestedPath[0]
        const withoutFirstKey = (() => {
            const copy = [...nestedPath]
            delete copy[0]
            return copy
        })()
        return (doc, instance) => {
            const docNested = assocPath(withoutFirstKey, instance, {})
            Object.defineProperty(doc, firstKey, {
                enumerable: true,
                value: docNested
            })
        }
    }
}

export function CreatePersistNestedAndPopulate(config: ConfigNestedAndPopulate) {
    const createPersistNestedAndPopulate = (data: Api.ResolverData2, next) => {
        const db = data.context.db
        const docs = path<object[]>(config.pathToDocs, data)
        const populate = getPopulateFx(config.nestedPath)

        if (config.nestedPath.length === 1) {
            for (let index = 0; index < docs.length; index++) {
                let doc = docs[index]
                const instance = Object.assign(
                    new config.Entity(),
                    config.defaultPropsFx(
                        doc,
                        //@ts-ignored
                        data,
                        index
                    )
                )
                db.persist(instance)
                populate(doc, instance)
            }
        }
        return next()
    }

    return createPersistNestedAndPopulate
}