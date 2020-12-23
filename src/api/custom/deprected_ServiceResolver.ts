// import { ClassType } from "..";
// import { AbstractClassOptions, ClassTypeResolver } from "../src/decorators/types";
// import { Resolver } from "../src";
// import { Ioc } from "../..";

// export const ServiceResolverToken = new Ioc.Token('serviceResolver');

// export function ServiceResolver(): ClassDecorator;
// export function ServiceResolver(options: AbstractClassOptions): ClassDecorator;
// export function ServiceResolver(
//     typeFunc: ClassTypeResolver,
//     options?: AbstractClassOptions,
// ): ClassDecorator;
// export function ServiceResolver(objectType: ClassType, options?: AbstractClassOptions): ClassDecorator;
// export function ServiceResolver(
//     objectTypeOrTypeFuncOrMaybeOptions?: Function | AbstractClassOptions,
//     maybeOptions?: AbstractClassOptions,
// ): ClassDecorator {
//     return constructor => {
//         Resolver(objectTypeOrTypeFuncOrMaybeOptions as any, maybeOptions)(constructor)
//         Ioc.Service({ multiple: true, id: ServiceResolverToken })(constructor)


//     }
// }