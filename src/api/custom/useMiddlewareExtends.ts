import { UseMiddleware, getMetadataStorage } from "../src"
import { Middleware } from "../src/interfaces/Middleware"

export function useMiddlewareExtends<T extends Function>(
    Extends: T,
    fieldName: Extract<keyof T['prototype'], string>,
    middlewares: Middleware[]) {
    let found = getMetadataStorage().middlewares.find(m => m.target === Extends)
    if (!found)
        UseMiddleware(middlewares)(Extends.prototype, fieldName)
    else
        found.middlewares.push(...middlewares)
}