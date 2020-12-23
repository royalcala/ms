import { Orm } from "."
import { Ioc, Scalar } from ".."
import { AnyEntity, EntityName, FilterQuery, FindOneOrFailOptions } from "../orm"
// import { ClassTypesWithScalars } from "../scalars/CustomScalar.abstract"

// export type TypeInjectEmByRequest<TEntity extends { new(): any }> = () => EntityManagerByRequest<TEntity, ClassTypesWithScalars<
//     InstanceType<TEntity>
// >>

export function InjectEntityManager(Entity: () => { new(): any }) {
    return (object: Object, propertyName: string, index?: number) => {
        Ioc.Container.registerHandler({
            object, propertyName, index, value: containerInstance => {
                const orm = containerInstance.get(Orm)
                return () => orm.EntityManager(Entity())
            }
        })
    }
}

export class EntityManager<
    TEntity extends AnyEntity<TEntity>,
    // TEntityScalars extends ClassTypesWithScalars<
    //     InstanceType<TEntity>
    // >
    >
{
    constructor(
        public orm: Orm,
        private Entity: EntityName<TEntity>
    ) {
        this.fork = this.orm.getFork(Entity)
    }
    fork: ReturnType<Orm['getFork']>

    em() {
        return this.fork
    }
    find(filter: FilterQuery<TEntity>) {
        return this.fork.find<TEntity>(this.Entity, filter)
    }

    findOneOrFail(where: FilterQuery<TEntity>, options?: FindOneOrFailOptions<TEntity, any>) {
        return this.fork.findOneOrFail<TEntity>(this.Entity, where)
    }
    async insert(doc: Partial<TEntity>) {
        //@ts-ignore
        if (!doc?._id) {
            //@ts-ignore
            doc._id = Scalar.ID.create()
        }
        const Entity = this.Entity as Function
        const metadataEntity = this.orm.storeMetadataEntities.get(Entity)
        await metadataEntity.pipeActions(doc, 'onBeforeInsertPersist')
        if (doc instanceof Entity)
            this.fork.persist(doc as any)
        else
            this.fork.persist(this.fork.create(Entity, doc))
        return doc
    }
    async update(
        doc: Partial<TEntity>,
        pk?: string
    ) {
        const Entity = this.Entity as Function
        pk = pk ?? this.fork.getMetadata().get(Entity.name).primaryKeys[0]
        //TODO difference with merge and map ????
        //set entity on unitOfWork
        const entity = this.fork.merge(Entity, { [pk]: doc[pk] })

        const metadataEntity = this.orm.storeMetadataEntities.get(Entity)
        await metadataEntity.pipeActions(doc, 'onBeforeUpdatePersist')
        //set listened changes
        return this.fork.assign<TEntity>(entity, doc)
    }
    updateMany(docs: Partial<TEntity>[]) {
        const Entity = this.Entity as Function
        const pk = this.fork.getMetadata().get(Entity.name).primaryKeys[0]
        return docs.map(
            doc => {
                this.update(doc, pk)
            }
        )
    }
    trash(id: any) {
        //move to trash doc entities
        // const entity = this.fork.merge(Entity,)
        //TODO json trash in each connection
    }
    trashClean() {

    }
    remove(doc: Partial<TEntity>) {
        const Entity = this.Entity as Function
        if (doc instanceof Entity)
            return this.fork.remove(doc as any)
        else {
            const pk = this.fork.getMetadata().get(Entity.name).primaryKeys[0]
            return this.fork.merge(Entity, { [pk]: doc[pk] })
        }
    }
    create(
        data: Partial<TEntity>
    ) {
        return this.fork.create(this.Entity, data)
    }
    flush() {
        return this.fork.flush()
    }

}