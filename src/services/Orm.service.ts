import { Service } from "../ioc";
import { MikroORM } from "@mikro-orm/core/MikroORM";
import { asyncLocalStorage } from "./AsyncLocalStorage.service";
import { StoreMetadataConnections } from "../orm/metadata/connection.metadata";
import { StoreMetadataEntities } from "../orm/metadata/entity.metadata";
import { EntityManager } from "./Orm.EntityManager";
import { AnyEntity, EntityName } from "../orm";
import type { OptionsCli } from "../cli";

@Service()
export class Orm {
    constructor(
        public storeMetadataConnection: StoreMetadataConnections,
        public storeMetadataEntities: StoreMetadataEntities
    ) { }
    // env: OptionsCli['env'] = 'production'

    forks = new Map<string, {
        requestId: any,
        em: MikroORM['em']
    }>()
    getRequestId(): number | undefined {
        return asyncLocalStorage.getStore()?.context?.requestId
    }
    getFork<T extends AnyEntity<T>>(Entity: EntityName<T>) {
        const metadataEntity = this.storeMetadataEntities.store.get(Entity)
        const requestId = this.getRequestId()
        const idFork = `${metadataEntity.metadataConnection.idConnection}!!${requestId}`
        if (this.forks.has(idFork))
            return this.forks.get(idFork).em

        const newFork = metadataEntity.metadataConnection.connection.em.fork()
        this.forks.set(idFork, {
            requestId,
            em: newFork,
        })
        return newFork
    }
    async requestFlush() {
        const requestId = this.getRequestId()
        let forks: MikroORM['em'][] = []
        let forksKeys: string[] = []
        this.forks.forEach(
            (value, key) => {
                const requestIdFromFork = Number(key.split('!!')[1]) || undefined
                if (requestIdFromFork === requestId) {
                    forks.push(value.em)
                    forksKeys.push(key)
                }
            }
        )

        await Promise.all(
            forks.map(
                em => em.flush()
            )
        )
        forksKeys.forEach(
            key => {
                this.forks.delete(key)
            }
        )

    }
    EntityManager = <TEntity extends { new(): any }>(Entity: TEntity) => {
        return new EntityManager(this, Entity)
    }

    // EntityManager<TEntity extends { new(): any }, TEntityScalars = ClassTypesWithScalars<
    //     InstanceType<TEntity>
    // >>(
    //     Entity: TEntity
    // ) {
    //     // return (requestId?: any) => {
    //     const fork = this.getFork(Entity) //get request 


    //     return {
    //         em() {
    //             return fork
    //         },
    //         getReference(id: any) {
    //             // fork.getMetadata().get(Entity.name).
    //             return fork.getReference<TEntityScalars>(Entity, id)
    //         },
    //         find: (filter: FilterQuery<TEntityScalars>) => {
    //             return fork.find<TEntityScalars>(Entity, filter)
    //         },
    //         findOneOrFail: (id: any) => {
    //             return fork.findOneOrFail<TEntityScalars>(Entity, id)
    //         },
    //         insert: async (instance: Partial<TEntityScalars>) => {
    //             const metadataEntity = this.storeMetadataEntities.get(Entity)
    //             await metadataEntity.pipeActions(instance, 'onBeforeInsertPersist')
    //             return fork.persist(instance)
    //         },
    //         /**
    //          * create new 
    //          */
    //         // update: async (found: any, data: Partial<TEntityScalars>) => {
    //         update: async (doc: Partial<TEntityScalars>) => {
    //             // const entityManager = fork as EntityManager
    //             // const qb = entityManager.createQueryBuilder(Entity)
    //             // qb.update({ hola: 'test' }).where({ id: found.id })
    //             // console.log(qb.getQuery());
    //             const pk = fork.getMetadata().get(Entity.name).primaryKeys[0]
    //             //TODO difference with merge and map ????
    //             //set entity on unitOfWork
    //             const entity = fork.merge(Entity, { [pk]: doc[pk] })

    //             const metadataEntity = this.storeMetadataEntities.get(Entity)
    //             await metadataEntity.pipeActions(doc, 'onBeforeUpdatePersist')
    //             return fork.assign<TEntityScalars>(entity, doc)
    //         },
    //         updateMany: (docs: Partial<TEntityScalars>[]) => {

    //             // fork.nativeUpdate(Entity)
    //             // fork.crea
    //             // fork.nativeUpdate
    //             // fork.nativeUpdate(Entity, { where: { id: 1 } })
    //         },
    //         create: (
    //             data: Partial<TEntityScalars>
    //         ) => {
    //             return fork.create<TEntityScalars, any>(Entity, data)
    //         },
    //         flush: () => {
    //             return fork.flush()
    //         }
    //     }
    // }
    // }
    // TInjectEntityManager: ReturnType<Orm<OrmTypes>['EntityManager']>
    // static InjectEntityManager(Entity: () => Entity | any) {
    //     return (target: Object, propertyName: string, index: number) => {
    //         // Ioc.Inject(Connection)(target, propertyName, index)
    //         Ioc.Container.registerHandler({
    //             object: target,
    //             propertyName: propertyName,
    //             index: index,
    //             value: containerInstance => {
    //                 //TODO resolve https://github.com/typestack/typedi/issues/150
    //                 //@ts-ignore
    //                 // const connection = containerInstance.services
    //                 //     .find(service => {
    //                 //         return service.type === entity().prototype.Connection
    //                 //     }).value as AbstractConnection

    //                 const orm = containerInstance.get(Orm)
    //                 return orm.EntityManager(Entity())
    //             }
    //         })
    //     }
    // }
}