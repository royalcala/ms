import { Api } from "../../../.."
import { ClassType } from "../../../../api"
import { Middleware } from "../../../../api/src/interfaces/Middleware"
import { ClassTypesWithScalars } from "../../../../scalars/CustomScalar.abstract"
import { MiddlewareAbstract } from "../Middleware.abstract"

export interface ResolverDataMutation<T> extends Api.ResolverData2<
    {
        //Args
        docs: T[],
    },
    {
        //ContextExtends,
        // MutationNested?: { [nameEntity: string]: Map<string, object> }
    }
    > { }
export type DefaultPropsFx<TEntity, TInputType> = (
    input: ClassTypesWithScalars<TInputType>,
    resolverData: ResolverDataMutation<TInputType>,
    index: number
) => Partial<Record<keyof TEntity, any>>

export type ConfigMutation<TEntity, TInputType> = {
    entity: ClassType<TEntity>,
    inputType?: ClassType<TInputType>,
    defaultPropsFx?: DefaultPropsFx<TEntity, TInputType>,
    path_to_docs?: string[]
}

export const MutationAbstract = (middlewares: () => Middleware<any>[]) => function MutationFx<
    TEntity,
    TInputType,
    >(
        {
            entity,
            defaultPropsFx = undefined,
            inputType = undefined,
            path_to_docs = ['args', 'docs']
        }: ConfigMutation<TEntity, TInputType>
    ) {

    abstract class Mutation extends MiddlewareAbstract<ResolverDataMutation<TInputType>> {
        config = {
            entity,
            defaultPropsFx,
            inputType,
            path_to_docs
        }
        protected middlewares: Middleware<any>[] = middlewares.apply(this)
    }

    return Mutation
}