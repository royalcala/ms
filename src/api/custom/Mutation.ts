import { Mutation as MutationSrc } from "../src";
import { AdvancedOptions, ReturnTypeFunc } from "../src/decorators/types";
import { WithDefaults } from "./Query";

export function Mutation(): MethodDecorator;
export function Mutation(options: AdvancedOptions): MethodDecorator;
export function Mutation(
    returnTypeFunc: ReturnTypeFunc,
    options?: AdvancedOptions,
): MethodDecorator;
export function Mutation(
    returnTypeFuncOrOptions?: ReturnTypeFunc | AdvancedOptions,
    maybeOptions?: AdvancedOptions,
): MethodDecorator {
    return (prototype, methodName: string) => {
        const withDefaults = WithDefaults(prototype, methodName, returnTypeFuncOrOptions, maybeOptions)
        //@ts-ignore
        MutationSrc(
            withDefaults.returnTypeFuncOrOptions as any,
            withDefaults.maybeOptions
        )(
            prototype,
            methodName
        )
    }
}

