import { GraphQLScalarType, GraphQLScalarTypeConfig } from "graphql";

export interface TCustomScalar {
    new(...args: any[]): {
        type: any
    }
    graphql: Omit<GraphQLScalarTypeConfig<any, any>, 'name'> | GraphQLScalarType
    mikrorm//:  typeof Type
    create: (value?: any) => any
}

export type ClassTypesWithScalars<T extends { [key: string]: TCustomScalar | any }> = { [K in keyof T]: T[K]['type'] }


export function CustomScalar() {
    return <T extends TCustomScalar>(constructor: T) => {
        //@ts-ignore
        constructor.graphql.name = constructor.name
        if (!(constructor.graphql instanceof GraphQLScalarType))
            constructor.graphql = new GraphQLScalarType(constructor.graphql as any)
    }
}