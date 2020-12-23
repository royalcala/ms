import { ClassType, ResolverData2 } from "../../../../api";
import type { DefaultPropsFx } from "./Mutation.abstract";
import { path } from 'ramda'


export function CreateInstanceAndDefaults<TEntity, TInputType>(
    Entity: ClassType<TEntity>,
    pathToDocs: string[],
    defaultProps: DefaultPropsFx<TEntity, TInputType>
) {
    const createInstanceAndDefaults = (data: ResolverData2, next) => {
        const docs = path<object[]>(pathToDocs, data)//data.args.docs
        for (let index = 0; index < docs.length; index++)
            docs[index] = Object.assign(
                new Entity(),
                Object.assign(
                    defaultProps(
                        docs[index] as any,
                        data as any,
                        index
                    ),
                    docs[index]
                )
            )
        return next()
    }
    return createInstanceAndDefaults
}