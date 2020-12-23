import { Type, Platform, EntityProperty, DateType, BigIntType } from '@mikro-orm/core';
import { GraphQLBoolean, GraphQLInt, GraphQLString, Kind } from 'graphql';
import { CustomScalar } from './CustomScalar.abstract';

class BooleanMkOrm extends Type<boolean, 0 | 1> {
    convertToDatabaseValue(value, platform: Platform) {
        return value ? 1 : 0
    }

    convertToJSValue(value, platform: Platform) {
        return value === 1 ? true : false
    }

    getColumnType(prop: EntityProperty, platform: Platform) {
        return `INTEGER(1)`
    }
}
const graphql = {
    description: `Boolean`,
    parseValue(value) {
        return Number(value) === 1 ? true : false
    },
    serialize(value) {
        return value
    },
    parseLiteral(ast) {
        return Number(ast.value) === 1 ? true : false
        // if (ast.kind === Kind.INT) {
        //     return new Date(ast.value) // ast value is always in string format
        // }
        // return null;
    }
}

@CustomScalar()
export class Boolean {
    type: number
    static graphql = GraphQLBoolean
    static mikrorm = BooleanMkOrm
    static create = (value: number) => Number(value) === 1 ? true : false
}