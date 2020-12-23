import { EntityOptions, Dictionary, Entity as EntitySrc, EntityName } from "@mikro-orm/core";
import { Ioc } from "../..";
import { MetadataConnection } from "./connection.metadata";
import { StoreMetadataConnections } from "./connection.metadata";

export class MetadataEntity {
    constructor(
        public target: Function
    ) { }
    metadataConnection: MetadataConnection
    onBeforeInsertPersist: ((entity: object) => any)[] = []
    onBeforeUpdatePersist: ((entity: object) => any)[] = []

    async pipeActions(entityData: object, type: keyof Pick<MetadataEntity, 'onBeforeInsertPersist' | 'onBeforeUpdatePersist'>) {
        for (let index = 0; index < this[type].length; index++) {
            await this[type][index](entityData)
        }
        // for (let index = 0; index < this.onBeforePersist.length; index++) {
        //     await this.onBeforePersist[index](entityData)
        // }
    }
    // async doBeforePersist(entityData: object) {
    //     for (let index = 0; index < this.onBeforePersist.length; index++) {
    //         await this.onBeforePersist[index](entityData)
    //     }
    // }
}

@Ioc.Service()
export class StoreMetadataEntities {
    store = new Map<EntityName<any>, MetadataEntity>()
    storeTemplates = new Map<Function, Function>()
    get(Entity: Function) {
        if (!this.store.has(Entity))
            return this.store.set(Entity, new MetadataEntity(Entity)).get(Entity)
        else
            return this.store.get(Entity)
    }
}

type Config = {
    connection: Function,
    optionsEntity?: EntityOptions<any>
}
export function Entity(config: Config) {
    return (constructor) => {
        const metadataEntities = Ioc.Container.get(StoreMetadataEntities)
        const metadataEntity = metadataEntities.get(constructor)
        metadataEntity.metadataConnection = Ioc.Container.get(StoreMetadataConnections).get(config.connection)
        return EntitySrc(config?.optionsEntity)(constructor)
    }
}

export function EntityTemplate() {
    return (constructor) => {
        const storeMetadataEntities = Ioc.Container.get(StoreMetadataEntities)
        storeMetadataEntities.storeTemplates.set(constructor, constructor)
    }
}


