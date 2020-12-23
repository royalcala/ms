import { Query as QuerySrc } from "../src";
import { AdvancedOptions, ReturnTypeFunc } from "../src/decorators/types";


export const WithDefaults = (
    prototype: object,
    methodName: string,
    returnTypeFuncOrOptions?: ReturnTypeFunc | AdvancedOptions,
    maybeOptions?: AdvancedOptions,
) => {
    const defaultName = `${prototype.constructor.name}_${methodName}`
    if (typeof returnTypeFuncOrOptions === 'object') {
        if (!returnTypeFuncOrOptions?.name)
            returnTypeFuncOrOptions.name = defaultName
    }
    else {
        if (!maybeOptions)
            maybeOptions = {}

        if (!maybeOptions?.name)
            maybeOptions.name = defaultName
    }
    return {
        returnTypeFuncOrOptions,
        maybeOptions
    }
}

export function Query(): MethodDecorator;
export function Query(options: AdvancedOptions): MethodDecorator;
export function Query(returnTypeFunc: ReturnTypeFunc, options?: AdvancedOptions): MethodDecorator;
export function Query(
    returnTypeFuncOrOptions?: ReturnTypeFunc | AdvancedOptions,
    maybeOptions?: AdvancedOptions,
): MethodDecorator {
    return (prototype, methodName: string) => {
        const withDefaults = WithDefaults(prototype, methodName, returnTypeFuncOrOptions, maybeOptions)
        // const defaultName = `${prototype.constructor.name}_${methodName}`
        // if (typeof returnTypeFuncOrOptions === 'object') {
        //     if (!returnTypeFuncOrOptions?.name)
        //         returnTypeFuncOrOptions.name = defaultName
        // }
        // else {
        //     if (!maybeOptions)
        //         maybeOptions = {}

        //     if (!maybeOptions?.name)
        //         maybeOptions.name = defaultName
        // }
        //@ts-ignore
        QuerySrc(
            withDefaults.returnTypeFuncOrOptions as any,
            withDefaults.maybeOptions
        )(
            prototype, methodName
        )
    }
}