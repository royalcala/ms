import { Api, Ioc } from "../../.."
import { ClassType, } from "../../../api"
import { ClassTypesWithScalars } from '../../../scalars/CustomScalar.abstract'
import { MiddlewareAbstract } from "./Middleware.abstract"

export type MutationResolverData<T = object> = Api.ResolverData<
    {
        //Args
        docs: T[],
    },
    {
        //ContextExtends,
        // MutationNested?: { [nameEntity: string]: Map<string, object> }
    }
>
export type DefaultPropsFx<TEntity, TInputType> = (
    input: ClassTypesWithScalars<TInputType>,
    resolverData: MutationResolverData<TInputType>,
    index: number
) => Partial<Record<keyof TEntity, any>>

export function ServiceMutation<
    TEntity,
    TInputType,
    >(
        config: {
            entity: ClassType<TEntity>,
            // entityResultArray?: boolean,
            inputType?: ClassType<TInputType>
            // inputTypeArray?: boolean,
            defaultProps: DefaultPropsFx<TEntity, TInputType>
        }
    ) {

    return <T extends typeof Mutation>(constructor: T) => {
        // if (!config?.inputTypeArray)
        //     config.inputTypeArray = true
        // if (!config?.entityResultArray)
        //     config.entityResultArray = true

        constructor.prototype.config = config as any
        Ioc.Service()(constructor)
    }
}



export abstract class Mutation extends MiddlewareAbstract {
    config: Parameters<typeof ServiceMutation>[0]



    static Mutation({ list = true }: { list?: boolean } = {}): MethodDecorator {
        const clazz = this as typeof Mutation
        return (target, key, descriptor) => {
            Api.Mutation(
                () => list === true
                    ? [clazz.prototype.config.entity]
                    : clazz.prototype.config.entity
            )(target, key, descriptor)
            Api.UseMiddleware(clazz as any)(target, key)
        }
    }
    static Arg({ list = true }: { list?: boolean } = {}) {
        if (!this.prototype?.config.inputType)
            throw new Error(`Required to define an InputType in ${this.name}`)

        return Api.Arg('docs', () => list === true
            ? [this.prototype.config.inputType]
            : this.prototype.config.inputType
            , { validate: false })
    }

    /**
     * Api
     * 
     * @type {
     * Mutation(()=>[Entity])
     * useMiddleware(Mutation)
     * function(
     *  Arg('docs',()=>[InputType]) docs
     * ){
     * return docs
     * }
     * }
     * @return object[]
     */
    static MutationMany() {
        return (target: Function['prototype'], key: string) => {
            if (target[key] === 'function')
                throw new Error(`You cannot use MutationMany with a method property`)
            const value = async function (docs: object[]) {
                return docs
            }
            Object.defineProperty(target, key, {
                value
            })

            this.Mutation({ list: true })(target, key, Object.getOwnPropertyDescriptor(target, key))
            this.setArg({
                target,
                index: 0,
                methodName: key,
                inputType: this.prototype.config.inputType,
                name: 'docs',
                typeOptions: { array: true, arrayDepth: 1 }
            })
        }
    }

    static MutationOne() {
        return (target: Function['prototype'], key: string) => {
            if (target[key] === 'function')
                throw new Error(`You cannot use MutationOne with a method property`)
            const value = async function (docs: object) {
                return docs[0]
            }
            Object.defineProperty(target, key, {
                value
            })

            this.Mutation({ list: false })(target, key, Object.getOwnPropertyDescriptor(target, key))
            this.setArg({
                target,
                index: 0,
                methodName: key,
                inputType: this.prototype.config.inputType,
                name: 'docs',
                typeOptions: {}
            })
        }
    }
}

// export abstract class Mutation extends MiddlewareAbstract {
//     config: Parameters<typeof ServiceMutation>[0]

//     static Mutation({ list = true }: { list?: boolean } = {}): MethodDecorator {
//         const clazz = this as typeof Mutation
//         return (target, key, descriptor) => {
//             Api.Mutation(
//                 () => list === true
//                     ? [clazz.prototype.config.entity]
//                     : clazz.prototype.config.entity
//             )(target, key, descriptor)
//             Api.UseMiddleware(clazz as any)(target, key)
//         }
//     }
//     static Arg({ list = true }: { list?: boolean } = {}) {
//         if (!this.prototype?.config.inputType)
//             throw new Error(`Required to define an InputType in ${this.name}`)

//         return Api.Arg('docs', () => list === true
//             ? [this.prototype.config.inputType]
//             : this.prototype.config.inputType
//             , { validate: false })
//     }

//     /**
//      * Api
//      * 
//      * @type {
//      * Mutation(()=>[Entity])
//      * useMiddleware(Mutation)
//      * function(
//      *  Arg('docs',()=>[InputType]) docs
//      * ){
//      * return docs
//      * }
//      * }
//      * @return object[]
//      */
//     static MutationMany() {
//         return (target: Function['prototype'], key: string) => {
//             if (target[key] === 'function')
//                 throw new Error(`You cannot use MutationMany with a method property`)
//             const value = async function (docs: object[]) {
//                 return docs
//             }
//             Object.defineProperty(target, key, {
//                 value
//             })

//             this.Mutation({ list: true })(target, key, Object.getOwnPropertyDescriptor(target, key))
//             this.setArg({
//                 target,
//                 index: 0,
//                 methodName: key,
//                 inputType: this.prototype.config.inputType,
//                 name: 'docs',
//                 typeOptions: { array: true, arrayDepth: 1 }
//             })
//         }
//     }

//     static MutationOne() {
//         return (target: Function['prototype'], key: string) => {
//             if (target[key] === 'function')
//                 throw new Error(`You cannot use MutationOne with a method property`)
//             const value = async function (docs: object) {
//                 return docs[0]
//             }
//             Object.defineProperty(target, key, {
//                 value
//             })

//             this.Mutation({ list: false })(target, key, Object.getOwnPropertyDescriptor(target, key))
//             this.setArg({
//                 target,
//                 index: 0,
//                 methodName: key,
//                 inputType: this.prototype.config.inputType,
//                 name: 'docs',
//                 typeOptions: {}
//             })
//         }
//     }
// }