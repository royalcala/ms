import express, { Application, IRouterMatcher, RequestHandler } from "express";
import { Service } from "../ioc";
import { RoutingControllersOptions, useExpressServer } from "../server";
import { asyncLocalStorage } from "./AsyncLocalStorage.service";

@Service()
export class ServerApp {
    /**
     * driver express() or koa()
     */
    driver = express()
    port: number
    /**
     * Routing classes
     */
    controllers: RoutingControllersOptions['controllers']
    private counter_requestId = 1
    private useAsyncLocalStorage = (req, res, next) => {
        const context = {
            requestId: this.counter_requestId++,
            user: {
                id: 1
            },
        }
        asyncLocalStorage.run({
            context
        }, () => {
            next()
        })
    }
    middlewares: any[] = [this.useAsyncLocalStorage]

    async startListen() {
        this.middlewares.forEach(
            middleware => {
                if (Array.isArray(middleware))
                    this.driver.use(...middleware)
                else
                    this.driver.use(middleware)
            }
        )
        useExpressServer(this.driver, { // register created express server in routing-controllers
            controllers: this.controllers // and configure it the way you need (controllers, validation, etc.)
        });


        await this.driver.listen({
            port: this.port
        },
            () => {
                console.log(`Server is running, listening in port ${this.port}`)
            }
        )
    }
}