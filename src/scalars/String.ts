import { Type, Platform, EntityProperty } from '@mikro-orm/core';
import { GraphQLString, Kind } from 'graphql';
import { CustomScalar } from './CustomScalar.abstract';

class mikrormString extends Type<string, string> {
    convertToDatabaseValue(value, platform: Platform) {
        return value
    }

    convertToJSValue(value, platform: Platform) {
        return value
    }

    getColumnType(prop: EntityProperty, platform: Platform) {
        return `varchar `
    }
}
// const graphql = {
//     description: `String`,
//     parseValue(value) {
//         return value
//     },
//     serialize(value) {
//         return value
//     },
//     parseLiteral(ast) {
//         return ast.value
//         // if (ast.kind === Kind.INT) {
//         //     return new Date(ast.value) // ast value is always in string format
//         // }
//         // return null;
//     }
// }

@CustomScalar()
export class String {
    type: string
    static graphql = GraphQLString
    static mikrorm = mikrormString
    static create = value => value//String(value)
}