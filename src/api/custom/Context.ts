import { DataLoader } from "../../dataloader";
import { ResolverData } from "../src";
export type Context<Extends extends object = {}> = {
    requestId: string,
    // db: ReturnType<typeof Fork>,
    user: {
        id: string
    },
    dataloaders: Map<any, DataLoader<any, any, any>>
} & Extends
export interface ResolverData2<Args extends object = {}, ContextExtends extends object = {}> extends Partial<
    ResolverData<
        Context<ContextExtends>
    >
    > {
    args: Args
}