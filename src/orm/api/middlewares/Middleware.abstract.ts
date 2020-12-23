import { Api, Ioc } from "../../.."
import { ResolverData2 } from "../../../api/custom/Context"
import { ResolverData } from "../../../api/src"
import { TypeOptions } from "../../../api/src/decorators/types"
import { Middleware, MiddlewareClass, MiddlewareFn } from "../../../api/src/interfaces/Middleware"

export abstract class MiddlewareAbstract<TResolverData extends ResolverData2> implements Api.MiddlewareInterface<any>{
    protected abstract middlewares: Middleware[]
 
    async use(data: TResolverData | ResolverData, lastNext) {
        if (this.middlewares.length > 0)
            return this.init_nexts(data, lastNext)
        else
            return lastNext()
    }
    addMiddleware(middlewares: Middleware<any>[]) {
        this.middlewares.push(...middlewares)
    }
    private init_nexts(data, lastNext) {
        const initMiddlewares = this.middlewares.map(
            (middleware, index) => {
                const isLast = index => (index + 1 === this.middlewares.length)
                const isClass = middleware => middleware?.prototype?.use ? true : false


                if (isClass(middleware)) {
                    let middlewareClass = Ioc.Container.get(middleware as MiddlewareClass)
                    if (isLast(index))
                        return () => middlewareClass.use(data, lastNext)
                    else
                        return () => middlewareClass.use(
                            data,
                            initMiddlewares[index + 1]
                        )
                }
                else {
                    let middlewareFx = middleware as MiddlewareFn
                    if (isLast(index))
                        return () => middlewareFx(data, lastNext)
                    else
                        return () => middlewareFx(
                            data,
                            initMiddlewares[index + 1]
                        )
                }

            }
        )
        return initMiddlewares[0]()
    }

    static useMiddleware(): MethodDecorator {
        return Api.UseMiddleware(this as any)
    }

    protected static setArg({ name, inputType, methodName, target, typeOptions, index }: {
        name: string,
        index: number,
        target: Function['prototype'],
        inputType: Function,
        methodName: string,
        typeOptions: TypeOptions
    }) {
        Api.getMetadataStorage().collectHandlerParamMetadata({
            kind: "arg",
            name,
            description: undefined,
            target: target.constructor,
            methodName,
            index,
            getType: () => inputType,
            typeOptions,
            validate: false
        });
    }
}