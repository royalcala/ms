import { ResolverData2 } from "../../../api";
import type { DefaultPropsFx } from "./Mutation.abstract";
import { path } from 'ramda'


export function DefaultProps<TEntity, TInputType>(
    pathToDocs: string[],
    defaultPropsFn: DefaultPropsFx<TEntity, TInputType>
) {
    const defaultProps = (data: ResolverData2, next) => {
        const docs = path<object[]>(pathToDocs, data)//data.args.docs
        for (let index = 0; index < docs.length; index++)
            docs[index] = Object.assign(
                docs[index],
                defaultPropsFn(
                    docs[index] as any,
                    data as any,
                    index
                )
            )
        return next()
    }
    return defaultProps
}