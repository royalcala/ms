import { Api, Scalar, Services } from '..'
import { TMetadata } from './Metadata.entity'



type Config = {
    orm: Services.Orm,
    dataLoader: Services.DataLoader,
    Entity: Function,
    EntityMetadata: Function
}
// @Api.ServiceResolver(() => Server)
export class MetadataApi {
    constructor(
        private config: Config,
        // private Entity: Function
    ) {
        this.extendsServerOnBeforePersist()
        Api.FieldResolver(() => this.config.EntityMetadata)(
            this.constructor.prototype,
            'metadata',
            Object.getOwnPropertyDescriptor(this.constructor.prototype, 'metadata')
        )
        Api.Root()(this.constructor.prototype, 'metadata', 0)
    }
    private extendsServerOnBeforePersist() {
        this.config.orm.storeMetadataEntities.get(this.config.Entity).onBeforeInsertPersist.push(
            (parent: { _id }) => {
                return this.insert({ _id: parent._id })
            }
        )
        this.config.orm.storeMetadataEntities.get(this.config.Entity).onBeforeUpdatePersist.push(
            (parent: { _id }) => {
                return this.update({ _id: parent._id })
            }
        )
    }

    insert(
        { _id }//Pick<TServer, 'id'>
    ) {
        const em = this.config.orm.EntityManager(this.config.EntityMetadata as any)
        const metadata = em.create({
            _id,
            // user_created: context.user.id,
            date_created: Scalar.DateTime.create()
        })
        this.config.dataLoader.getDataLoaderEntity(this.config.EntityMetadata as any)._cacheMap.set(metadata.id, metadata)
        return em.insert(metadata)
    }

    async update(
        { _id }//Pick<TServer, 'id'>
    ) {
        // const found = await this.config.dataLoader.getDataLoaderEntity(this.config.EntityMetadata as any).load(id) //as Promise<TServerMetadata>
        const em = this.config.orm.EntityManager(this.config.EntityMetadata as any)
        const newData = await em.update({
            // user_updated,
            _id,
            date_updated: Scalar.DateTime.create()
        } as TMetadata)
        this.config.dataLoader.getDataLoaderEntity(this.config.EntityMetadata as any)._cacheMap.set(_id, newData)
        return newData
    }


    // @Api.FieldResolver(() => ServerMetadata)
    async metadata(
        // @Api.Root()
        parent//: TServer & { metadata?: TServerMetadata },
    ) {

        return this.config.dataLoader.getDataLoaderEntity(this.config.EntityMetadata as any).load(parent.id) //as Promise<TServerMetadata>
    }
}


// export function getResolver<T extends object, K extends keyof T>(o: T, methodKey: K) {
//     const fx = o[methodKey] as any
//     return fx.bind(o) as (doc: object, requestId: string) => Promise<any>
// }


// export class MetadataApi<TApi extends object = {}>{
//     constructor(
//         // config: {
//         //     orm: Services.Orm,
//         //     ApiToExtend: TApi,
//         //     ApiInsert: keyof TApi,
//         //     ApiUpdate: keyof TApi,
//         //     MetadataEntity,
//         // }
//         protected orm: Services.Orm,
//         protected ApiToExtend: TApi,
//         protected ApiMethod: keyof TApi,
//         protected MetadataEntity,

//     ) {
//         this.extendsMutationInsert()
//     }

//     protected extendsMutationInsert() {
//         //TODO https://github.com/typestack/typedi/issues/150

//         const resolver = Api.getResolver(this.ApiToExtend, this.ApiMethod)
//         //@ts-ignore
//         this.ApiToExtend[this.ApiMethod] = async (doc, requestId) => {
//             const parent = await resolver(doc, requestId)
//             const child = this.insertMetadata(parent, requestId)
//             parent.metadata = child
//             return parent
//         }
//     }

//     protected insertMetadata(
//         parent,
//         requestId
//     ) {
//         const em = this.orm.EntityManager(this.MetadataEntity)
//         const metadata = em.create({
//             id: parent.id,
//             // user_created: context.user.id,
//             date_created: Scalar.DateTime.create()
//         })
//         em.persist(metadata)
//         return metadata
//     }
//     metadata: (...any) => any

// }

// type Config<TApiToExtend, KeyApiMethod, TMetadata> = {
//     ObjectType: () => ClassType,
//     ApiToExtend: TApiToExtend,
//     MetadataEntity: TMetadata,
//     ApiMethod: KeyApiMethod,
// }

// export function MetadataApi<
//     TApiToExtend extends Function,
//     KeyApiMethod extends keyof TApiToExtend['prototype'],
//     TMetadata extends typeof Metadata
// >(
//     {
//         ObjectType,
//         MetadataEntity,
//         ApiToExtend,
//         ApiMethod,
//     }: Config<TApiToExtend, KeyApiMethod, TMetadata>
// ) {
//     const ObjectTypeFieldName = 'metadata'
//     const MetadataEntityRelation = 'id' as keyof Metadata

    // @Api.ObjectTypeExtends(ObjectType)
//     class ObjectTypeWithMetadataField extends ObjectType() {
//         @Api.Field(() => MetadataEntity, { nullable: true })
//         metadata(
//             @Api.Root() parent,
//             @Api.Dataloader(ObjectTypeWithMetadataField, MetadataEntityRelation) dataloader: Api.decorator.DataLoaderParam
//         ) {
//             if (parent[ObjectTypeFieldName])
//                 return parent[ObjectTypeFieldName]
//             else
//                 return dataloader(parent.id)
//         }
//     }
//     @Ioc.Service()
//     @Api.Resolver(() => ObjectType, { isAbstract: true })
//     abstract class AbstractMetadata {
//         constructor(
//             private orm: Services.Orm,
//         ) {
//             console.log('1***********************')
//             this.extendsMutation_server_insertOne()
//             console.log('2***********************')
//         }

//         private extendsMutation_server_insertOne() {
//             //TODO https://github.com/typestack/typedi/issues/150
//             //@ts-ignore
//             const apiToExtend = Ioc.Container.globalInstance.services.find(
//                 service => {
//                     return service.type === ApiToExtend
//                 }
//             ).value as any
//             console.log('4***********************')
//             const resolver = Api.getResolver(apiToExtend, ApiMethod)
//             console.log('5***********************', resolver)
//             apiToExtend[ApiMethod] = async (doc, requestId) => {
//                 console.log('3***********************')
//                 const parent = await resolver(doc, requestId)
//                 const child = this.insertMetadata(parent, requestId)
//                 this.populateMetadata(parent, child)
//                 return parent
//             }
//             console.log('end')
//         }

//         insertMetadata(
//             parent,
//             requestId
//         ) {
//             const em = this.orm.EntityManager(MetadataEntity as any)(requestId)
//             const metadata = em.create({
//                 id: parent.id,
//                 // user_created: context.user.id,
//                 date_created: Scalar.DateTime.create()
//             })
//             em.persist(metadata)
//             console.log({ metadata })
//             // context.db.persist(metadata)
//             return metadata
//         }

//         populateMetadata(
//             parent,
//             child
//         ) {
//             parent[ObjectTypeFieldName] = child
//             return parent
//         }

//         static Type: ObjectTypeWithMetadataField

//     }

//     return AbstractMetadata
// }