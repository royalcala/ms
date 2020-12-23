import { ClassType } from "..";
import { AbstractClassOptions, ClassTypeResolver } from "../src/decorators/types";
import { Resolver } from "../src";
import { Ioc } from "../..";


@Ioc.Service()
export class ServicesResolvers {
    store = new Map<Function, Function>()
}



export function ServiceResolver(): ClassDecorator;
export function ServiceResolver(options: AbstractClassOptions): ClassDecorator;
export function ServiceResolver(
    typeFunc: ClassTypeResolver,
    options?: AbstractClassOptions,
): ClassDecorator;
export function ServiceResolver(objectType: ClassType, options?: AbstractClassOptions): ClassDecorator;
export function ServiceResolver(
    objectTypeOrTypeFuncOrMaybeOptions?: Function | AbstractClassOptions,
    maybeOptions?: AbstractClassOptions,
): ClassDecorator {
    return constructor => {
        const apis = Ioc.Container.get(ServicesResolvers)
        apis.store.set(constructor, constructor)
        Resolver(objectTypeOrTypeFuncOrMaybeOptions as any, maybeOptions)(constructor)
        Ioc.Service()(constructor)
    }
}
