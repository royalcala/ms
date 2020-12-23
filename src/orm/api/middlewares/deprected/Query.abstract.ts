import { FilterQuery } from "@mikro-orm/core"
import { Api, Ioc, Scalar } from "../../../.."
import { ClassType, } from "../../../../api"
import { MiddlewareAbstract } from "../Middleware.abstract"
import { DataLoader } from "../../../../dataloader";
export function ServiceQuery<
    TEntity,
    >(
        config: {
            entity: ClassType<TEntity>
        }
    ) {

    return <T extends typeof Query>(constructor: T) => {
        constructor.prototype.config = config as any
        Ioc.Service()(constructor)
    }
}
export abstract class Query extends MiddlewareAbstract {
    config: Parameters<typeof ServiceQuery>[0]
    middlewares = []

    private static Find(type: 'many' | 'one') {
        return function () {
            const clazz = this
            return (target: Function['prototype'], key: string) => {
                if (target[key] === 'function')
                    throw new Error(`You cannot use FindMany with a method property`)
                const value = async function (
                    filter: FilterQuery<any>,
                    { db }: Api.Context,
                ) {
                    if (type === 'many')
                        return db.find(clazz.prototype.config.entity, filter || {})
                    else
                        return db.findOne(clazz.prototype.config.entity, filter || {})
                }
                Object.defineProperty(target, key, {
                    value
                })
                Api.getMetadataStorage().collectQueryHandlerMetadata({
                    methodName: key,
                    schemaName: key,
                    target: target.constructor,
                    getReturnType: () => clazz.prototype.config.entity,
                    returnTypeOptions: type === 'many' ? { array: true, arrayDepth: 1 } : {},
                    description: undefined,
                    deprecationReason: undefined,
                    complexity: undefined,

                });

                this.setArg({
                    index: 0,
                    name: 'filter',
                    inputType: Scalar.Json,
                    methodName: key,
                    target,
                    typeOptions: {}
                })

                Api.Ctx()(target, key, 1)


            }
        }
    }
    static FindMany = Query.Find('many')
    static FindOne = Query.Find('one')

    static FieldResolver({ parentRelationKey, childRelationKey }: { parentRelationKey: string, childRelationKey: string }) {
        const clazz = this
        return (target: Function['prototype'], methodName: string) => {
            if (target[methodName] === 'function')
                throw new Error(`You cannot use FindMany with a method property`)
            const value = async function (
                parentData: any,
                { db, dataloaders }: Api.Context,
            ) {
                const ChildEntity = clazz.prototype.config.entity
                //is in Persist
                if (parentData[methodName])
                    return parentData[methodName]

                if (!dataloaders.has(ChildEntity))
                    dataloaders.set(
                        ChildEntity,
                        new DataLoader(
                            async parentRelationKeys => {
                                const childDocs = await db.find(ChildEntity, { $and: [{ [childRelationKey]: { $in: parentRelationKeys } }] })
                                const map = {}
                                for (let index = 0; index < childDocs.length; index++) {
                                    let childDoc = childDocs[index]
                                    map[
                                        childDoc[childRelationKey]
                                    ] = childDoc
                                }
                                return parentRelationKeys.map(key => map[key] || [])
                            }
                        )
                    )

                return dataloaders.get(ChildEntity).load(parentData[parentRelationKey])
            }
            Object.defineProperty(target, methodName, {
                value
            })
            Api.getMetadataStorage().collectFieldResolverMetadata({
                kind: "external",
                methodName,
                schemaName: methodName,
                target: target.constructor,
                getType: undefined,
                typeOptions: undefined,
                complexity: undefined,
                description: undefined,
                deprecationReason: undefined,
            });
            Api.decorator.Parent()(target, methodName, 0)
            Api.Ctx()(target, methodName, 1)
        }
    }
}