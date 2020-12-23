import { Options, MikroORM, ReflectMetadataProvider, FilterQuery } from "@mikro-orm/core";
import { Ioc, Api } from "../..";
import { ClassTypesWithScalars } from "../../scalars/CustomScalar.abstract";
import { CallerPath } from "../../tools/CallerPath";
import path from "path";

export interface Entity {
    new(): ClassTypesWithScalars<any>
    Connection: typeof AbstractConnection
}

export const Token = new Ioc.Token('serviceConnection');
export function Service({
    metadataProvider = ReflectMetadataProvider,
    cache = { enabled: false },
    batchSize = 500,
    ...others
}: Options) {
    const callerPath = path.normalize(CallerPath() + '/../')
    return <T extends typeof AbstractConnection>(constructor: T) => {
        if (!others?.baseDir)
            others.baseDir = callerPath
        if (!others?.dbName)
            others.dbName = `${others.baseDir}/data/${constructor.name}.db`
        // else //:memory: doesnt has directory 
        //     others.dbName = `${others.baseDir}/${others.dbName}`

        constructor.prototype.options = {
            ...others,
            metadataProvider,
            cache,
            batchSize
        }
        Ioc.Service({ multiple: true, id: Token })(constructor)
    }
}

export abstract class AbstractConnection {
    options: Options
    entities: Entity[]
    // connection: MikroORM
    // async startConnection() {
    //     if (!this?.connection?.isConnected) {
    //         this.connection = await MikroORM.init({
    //             // metadataProvider: ReflectMetadataProvider,
    //             // cache: { enabled: false },
    //             // entities: ['**/*.entity.{js,ts}'],
    //             // type: 'sqlite',
    //             // dbName: this.config.baseDir + "/data/data.db",
    //             // // dbName:':memory:',
    //             // baseDir: this.config.baseDir,
    //             // batchSize: 500,
    //             ...this.options,
    //             entities: this.entities as any
    //         })
    //     }
    //     return this.connection
    // }

    // em<TEntity extends Function>(Entity: TEntity) {
    //     if (!this?.connection?.isConnected) {
    //         this.startConnection()
    //         throw new Error(`The connection to the database was disconnected. try again.`)
    //     }
    //     return new EmByEntity<TEntity>(this.connection, Entity)
    // }
    static loadEntity() {
        return (constructor: Entity | any) => {
            constructor.prototype.Connection = this
            if (!this.prototype?.entities)
                this.prototype.entities = []
            this.prototype.entities.push(constructor)
        }
    }
}
// const Forks = new Map<string, MikroORM['em']>()
// export class EmByEntity<TEntity>{
//     constructor(
//         private connection: MikroORM,
//         private Entity: Function
//     ) { }

//     byRequest(requestId: Api.Context['requestId'] | undefined) {
//         const fork = Forks.has(requestId)
//             ? Forks.get(requestId)
//             : (
//                 () => {
//                     const newFork = this.connection.em.fork()
//                     Forks.set(requestId, newFork)
//                     return newFork
//                 }
//             )()

//         return {
//             find: (filter: FilterQuery<TEntity>) => {
//                 return this.connection.em.find<ClassTypesWithScalars<TEntity>>(this.Entity, filter as any)
//             },
//             findOneOrFail: (id: any) => {
//                 return this.connection.em.findOneOrFail<ClassTypesWithScalars<TEntity>>(this.Entity, id)
//             },
//             persist: (instance: ClassTypesWithScalars<TEntity>) => {
//                 return this.connection.em.persist(instance)
//             },
//             assign: (data: ClassTypesWithScalars<TEntity>) => {
//                 return this.connection.em.assign<ClassTypesWithScalars<TEntity>>(this.Entity as any, data)
//             },
//             flush: () => {

//             }
//         }
//     }
// }


//TODO create Db.Entity.connection = AbstractConnection


// export function Inject(entity: () => Entity | any) {
//     return (target: Object, propertyName: string, index: number) => {
//         // Ioc.Inject(Connection)(target, propertyName, index)
//         Ioc.Container.registerHandler({
//             object: target,
//             propertyName: propertyName,
//             index: index,
//             value: containerInstance => {
//                 //TODO resolve https://github.com/typestack/typedi/issues/150
//                 //@ts-ignore
//                 const connection = containerInstance.services
//                     .find(service => {
//                         return service.type === entity().prototype.Connection
//                     }).value as AbstractConnection
//                 return connection.em(entity)
//             }
//         })
//     }
// }