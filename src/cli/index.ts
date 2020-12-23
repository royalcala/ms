#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Ioc, Services } from "..";
import fs from "fs";
import Path from "path";


export type OptionsCli = {
    baseUrl: string,
    env: 'production' | 'testing',
    port: number,
    connections: string,
    data: string,
    entities: string,
    api: string
}

yargs(hideBin(process.argv))
    .command(
        'start [baseUrl]', 'Start server',
        (yargs: yargs.Argv<OptionsCli>) => {
            yargs
                .positional('baseUrl', {
                    describe: 'Relative directory from is using the cli',
                    type: 'string',
                    default: '.',
                    coerce: (value) => {
                        return Path.resolve(value)
                    }
                })
                .option('env', {
                    type: 'string',
                    choices: ['production', 'testing'],
                    default: 'production'
                })
                .option('port',{
                    type:'number',
                    default:8008
                })
                .option('connections', {
                    type: 'string',
                    description: 'baseUrl + pattern connection files',
                    default: '**/*.connection.{ts,js}'
                })
                .option('connections', {
                    type: 'string',
                    description: 'baseUrl + pattern connection files',
                    default: '**/*.connection.{ts,js}'
                })
                .option('api', {
                    type: 'string',
                    description: 'baseUrl + pattern api files',
                    default: '**/*.api.{ts,js}'
                })
                .option('entities', {
                    type: 'string',
                    description: 'baseUrl + pattern entity files',
                    default: '**/*.entity.{ts,js}'
                })
                .option('data', {
                    type: 'string',
                    description: 'directory for save the embbebed data',
                })

        },
        async (args: OptionsCli) => {
            const concanateBaseUrl = value => args.baseUrl + '/' + value
            args.data = args?.data ? Path.resolve(args.data) : args.baseUrl
            args.api = concanateBaseUrl(args.api)
            args.connections = concanateBaseUrl(args.connections)
            args.entities = concanateBaseUrl(args.entities)

            if (!fs.existsSync(args.data)) {
                fs.mkdirSync(args.data, { recursive: true })
                console.log(`Created data directory:${args.data}`)
            }
            else
                console.log(`Using data directory:${args.data}`)

            const Orm = Ioc.Container.get<Services.Orm>(Services.Orm)
            const Gql = Ioc.Container.get(Services.Gql)
            const Server = Ioc.Container.get(Services.ServerApp)

            //ORM
            await Orm.storeMetadataConnection.loadConnectionsByGlobSearch(
                args.connections,
                args.env,
                args.data
            )
            await Orm.storeMetadataConnection.loadEntitiesByGlobSearch(args.entities)
            await Orm.storeMetadataConnection.startConnections()
            await Orm.storeMetadataConnection.buildEntitiesSchemas(args.env)

            //GQL
            // Gql.config.port = options.port as number
            await Gql.loadResolversByGlobSearch(args.api)
            await Gql.buildSchema()
            // await Gql.startServer()
            await Gql.pushServerMiddleware()

            //SERVER
            Server.port = args.port as number
            await Server.startListen()
        }
    ).argv