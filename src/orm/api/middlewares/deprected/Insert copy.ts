import { PersistInstance } from "."
import { Mutation, MutationResolverData } from "./Mutation.abstract"
import { Middleware } from "../../../api/src/interfaces/Middleware"
import { ValidateInstance } from "../../../validator"
import { CreateInstanceAndDefaults } from "./CreateInstanceAndDefaults";
import { path } from 'ramda'

// export const PATH_TO_DOCS = ['args', 'docs']
export const CastOneToMany = (pathToDocs: string[]) => {
    const castOneToMany = (data: MutationResolverData<any>, next) => {
        let docs = path<object[]>(pathToDocs, data)
        if (!Array.isArray(docs)) {
            const copy = [...pathToDocs]
            const last = copy[copy.length - 1]
            copy.pop()
            let point = path(copy, data)
            point[last] = [docs]
        }
        return next()
    }
    return castOneToMany
}

export abstract class Insert extends Mutation {
    PATH_TO_DOCS = ['args', 'docs']
    protected middlewares: Middleware[] = [
        // CastOneToMany(this.PATH_TO_DOCS),
        (data: MutationResolverData<any>, next) => CreateInstanceAndDefaults(
            this.config.entity,
            this.PATH_TO_DOCS,
            this.config.defaultProps
        )(data, next),
        ValidateInstance(this.PATH_TO_DOCS),
        PersistInstance(this.PATH_TO_DOCS)
    ]
}

export const populate = (docs: object[], index: number, instance, nestedPath: string[],) => {
    if (nestedPath.length === 1)
        docs[index][nestedPath[0]] = instance
    else {
        let copyPath = [...nestedPath]
        let lastKey = copyPath.pop()
        let point = path(copyPath, docs[index])
        point[lastKey] = instance
    }
}

export abstract class InsertNested extends Mutation {
    abstract nestedPath: string[]
    protected middlewares: Middleware[] = [
        (data: MutationResolverData<any>, next) => this.init_instancesAndDefaults(data, next)
    ]
    protected init_instancesAndDefaults(data: MutationResolverData<any>, next) {
        const Entity = this.config.entity
        const db = data.context.db
        let docs = data.args.docs
        for (let index = 0; index < docs.length; index++) {
            // const cascade = docs[index][this.nestedKey] || {}
            const instance = Object.assign(
                new Entity(),
                {
                    ...this.config.defaultProps(
                        docs[index],
                        data,
                        index
                    ),
                    // ...cascade
                }
            )
            db.persist(instance)
            populate(docs, index, instance, this.nestedPath)
        }
        return next()
    }
}