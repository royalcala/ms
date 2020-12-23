import { buildSchema, fetch, ServicesResolvers, } from "../api";
import * as CustomScalars from "../scalars";
import { Container, Service } from "../ioc";
import { Orm } from "./Orm.service";
import { ExecutionResult, GraphQLSchema } from "graphql";
import { glob } from "glob";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { execute } from "graphql";
import { asyncLocalStorage } from "./AsyncLocalStorage.service";
import { Ioc } from "..";
import { ServerApp } from "./Server.service";
// import { cli_props } from "../cli";
@Service()
export class Gql {
    constructor(
        private orm: Orm,
        //api.ServicesResolvers
        private servicesResolvers: ServicesResolvers,
        private serverApp: ServerApp
    ) { }
    config: {
        // port: number,
        path: string
        // resolversDir: string
    } = {
            // port: 8000,
            path: '/graphql',
            // resolversDir: ''
        }
    // server = express()
    // counter_requestId = 1
    // middleware_als = (req, res, next) => {
    //     const context = {
    //         requestId: this.counter_requestId++,
    //         user: {
    //             id: 1
    //         },
    //     }
    //     asyncLocalStorage.run({
    //         context
    //     }, () => {
    //         next()
    //     })
    // }
    schema: GraphQLSchema

    loadResolversByGlobSearch(globPattern: string) {
        // const globPath = `${this.config.resolversDir}/**/*.{js,ts}`
        console.log(`Searching api.servicesResolvers in ${globPattern}`)
        glob.sync(globPattern).forEach(
            path => {
                require(path)
            }
        )
        // const resolvers = [...this.servicesResolvers.store.values()]
        // resolvers.forEach(resolver => {
        //     Ioc.Container.get(resolver)
        // })
        // return resolvers as any
    }
    async buildSchema() {
        try {
            //TODO implement later for performance https://github.com/zalando-incubator/graphql-jit
            // const servicesResolver = Container.getMany(ServiceResolverToken).map(instance => instance.constructor)
            const resolvers = [...this.servicesResolvers.store.values()]

            resolvers.forEach(resolver => {
                Ioc.Container.get(resolver)
            })
            this.schema = await buildSchema({
                resolvers: resolvers as any,
                validate: false,//class-validation automatic
                dateScalarMode: 'timestamp',
                nullableByDefault: true,
                scalarsMap: [
                    ...Object.values(CustomScalars).map(
                        value => {
                            return {
                                type: value,
                                scalar: value.graphql as any
                            }
                        }
                    )
                ],
                container: Container,
                // globalMiddlewares: [ErrorInterceptor, ResolveTime],
            })

        } catch (error) {
            throw new Error(error)
        }
    }
    async pushServerMiddleware() {
        // this.server.use(this.middleware_als)
        this.serverApp.middlewares.push(
            [
                this.config.path,
                graphqlHTTP(
                    (request) => {
                        return {
                            schema: this.schema,
                            context: asyncLocalStorage.getStore().context,
                            customExecuteFn: async (args) => {
                                let response = await execute(args)
                                await this.orm.requestFlush()
                                return response
                            },
                            graphiql: true,
                        }
                    }
                ),
            ]
        )
        // this.server.use(
        //     this.config.path,
        //     graphqlHTTP(
        //         (request) => {
        //             return {
        //                 schema: this.schema,
        //                 context: asyncLocalStorage.getStore().context,
        //                 customExecuteFn: async (args) => {
        //                     let response = await execute(args)
        //                     await this.orm.requestFlush()
        //                     return response
        //                 },
        //                 graphiql: true,
        //             }
        //         }
        //     ),
        // )

        // this.server.listen({
        //     port: this.config.port
        // },
        //     () => {
        //         console.log(`Server is running, GraphQL Playground available at http://localhost:${this.config.port}/graphql`);
        //     }
        // )

        // const server = new ApolloServer({
        //     schema: this.schema,
        //     playground: true,

        //     context: (): Context => {
        //         // asyncLocalStorage.run()
        //         // const eid = async_hooks.executionAsyncId();
        //         // const tid = async_hooks.triggerAsyncId();
        //         // console.log({ eid, tid })
        //         // asyncLocalStorage.run(idSeq++, () => {
        //         //     logWithId('start');
        //         //     // Imagine any chain of async operations here
        //         //     setImmediate(() => {
        //         //       logWithId('finish');
        //         //     //   res.end();
        //         //     });
        //         //   });
        //         return {
        //             requestId: v1(),
        //             user: {
        //                 id: '1'
        //             },
        //             // create fresh instance of entity manager per request
        //             // https://mikro-orm.io/docs/identity-map
        //             // db: this.orm.createFork(),
        //             dataloaders: new Map()
        //         }
        //     },
        //     plugins: [
        //         {
        //             requestDidStart: () => ({
        //                 willSendResponse: async ({ context, operationName, response }) => {
        //                     const { requestId } = context as Context
        //                     // await db.flush()//save all the data to the database  
        //                     await this.orm.requestFlush(requestId)
        //                     if (operationName === 'holis') {
        //                         // console.log('**********willSendResponse', { operationName, context, response })
        //                     }
        //                 },
        //             }),
        //         },
        //     ],
        // })


        // const { url } = await server.listen(this.config.port);
        // console.log(`Server is running, GraphQL Playground available at ${url}`);
    }


    async fetch({
        query, variables = {}, host = 'localhost', port = this.serverApp.port, path = this.config.path
    }: {
        query: string, variables?: object, host?: string, port?: number, path?: string
    }) {
        //TODO json stringify fastify
        const postData = JSON.stringify({
            query,
            variables
        })
        const buffer = await fetch({
            host,
            port,
            path
        })(postData)
        // console.log({ data })
        // console.log('parse:',JSON.parse(data))
        return JSON.parse(buffer as any) as ExecutionResult<any, any>
    }

    // graphql(query: ParamsGraphql[1], context: ParamsGraphql[3] = {}, variables: ParamsGraphql[4] = {}) {
    //     return graphql(this.schema, query, null, context, variables)
    // }
}




