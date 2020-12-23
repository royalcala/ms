import { Options, ReflectMetadataProvider, MikroORM } from "@mikro-orm/core"
import glob from "glob";
import path from "path";
import { Ioc } from "../..";
import { OptionsCli } from "../../cli";
// import { cli_props } from "../../cli";
import { CallerPath } from "../../tools/CallerPath";
import { StoreMetadataEntities } from "./entity.metadata";


export function Connection(
    { metadataProvider = ReflectMetadataProvider,
        cache = { enabled: false },
        batchSize = 500,
        useBatchUpdates = true,
        useBatchInserts = true,
        ...others }: Options) {
    const callerPath = path.normalize(CallerPath() + '/../')
    return (constructor) => {
        const metadataConnection = Ioc.Container.get(StoreMetadataConnections).get(constructor)
        if (!others?.baseDir)
            others.baseDir = callerPath// path to your JS entities (dist), relative to `baseDir`
        if (!others?.dbName)
            others.dbName = `${others.baseDir}data/${constructor.name}`
        metadataConnection.config = {
            ...others,
            metadataProvider,
            cache,
            batchSize,
            useBatchUpdates,
            useBatchInserts
        }
    }
}


export class MetadataConnection {
    idConnection: string
    config: Options
    connection: MikroORM
    async startConnection() {
        console.log('Starting connection', this.idConnection)
        const storeMetadataEntities = Ioc.Container.get(StoreMetadataEntities)
        const entities = [...storeMetadataEntities.store.values()].filter(
            e => e.metadataConnection === this
        ).map(e => e.target)
        if (entities.length > 0)
            this.connection = await MikroORM.init({
                ...this.config,
                entities: [
                    ...entities,
                    ...storeMetadataEntities.storeTemplates.values(),
                    //
                ] as any
            })
        else
            console.log(`No entities found for connection:${this.idConnection}`)
    }
}

@Ioc.Service()
export class StoreMetadataConnections {
    store = new Map<Function, MetadataConnection>()
    private idConnectionSeq = 0
    get(clazz: Function) {
        if (!this.store.has(clazz)) {
            const metadata = this.store.set(clazz, new MetadataConnection()).get(clazz)
            metadata.idConnection = String(clazz.name + this.idConnectionSeq++)
            return metadata
        }
        else
            return this.store.get(clazz)
    }
    private dbNamePostFixEnv(env: OptionsCli['env'] = 'production') {
        this.store.forEach(
            (metadataConnection) => {
                if (
                    metadataConnection.config.type === 'sqlite'
                    &&
                    metadataConnection.config.dbName !== ':memory:'
                ) {
                    metadataConnection.config.dbName = `${metadataConnection.config.dbName}.${env}.db`
                }
            }
        )
    }
    private changeDefaultDataDir(dataDir: string) {
        this.store.forEach(
            (metadataConnection) => {
                if (
                    metadataConnection.config.type === 'sqlite'
                    &&
                    metadataConnection.config.dbName !== ':memory:'
                ) {
                    // console.log({
                    //     dataDir,
                    //     dbName: metadataConnection.config.dbName,
                    //     pathBaseName: path.resolve(
                    //         dataDir,
                    //         path.basename(metadataConnection.config.dbName)
                    //     )
                    // })
                    metadataConnection.config.dbName = path.resolve(
                        dataDir,
                        path.basename(metadataConnection.config.dbName)
                    )
                }
            }
        )
    }
    loadConnectionsByGlobSearch(
        globPattern: string,
        env: OptionsCli['env'],
        dataDir?: string
    ) {
        console.log(`Searching connections in ${globPattern}`)
        glob.sync(globPattern).forEach(
            path => {
                require(path)
            }
        )
        this.dbNamePostFixEnv(env)
        if (dataDir)
            this.changeDefaultDataDir(dataDir)
    }
    loadEntitiesByGlobSearch(globPattern: string) {
        console.log(`Searching entities in ${globPattern}`)
        glob.sync(globPattern).forEach(
            path => {
                require(path)
            }
        )
    }
    async startConnections() {
        // this.loadConnectionsByGlobSearch()
        // this.loadEntitiesByGlobSearch()
        const metadataConnections = [...this.store.values()]
        return Promise.all(
            metadataConnections.map(
                metadataConnection => metadataConnection.startConnection()
            )
        )
    }
    async buildEntitiesSchemas(env: OptionsCli['env']) {
        console.log(`Starting schemas entities...`);
        await Promise.all(
            ([...this.store.values()]).map(
                async metadataConnection => {
                    if (metadataConnection?.connection?.isConnected) {
                        const generator = metadataConnection.connection.getSchemaGenerator();
                        if (env === 'testing') {
                            await generator.dropSchema();
                            await generator.createSchema();
                            await generator.updateSchema();
                        } else {
                            //TODO define production enviroment
                            await generator.createSchema()
                        }
                    } else {
                        console.log(`no builds for ${metadataConnection.idConnection} because is not connected`)
                    }
                }
            )
        )
    }
}


