import { Type, Platform, EntityProperty } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Kind } from 'graphql';
import { CustomScalar } from './CustomScalar.abstract';

class mikrormID extends Type<number, number> {
    convertToDatabaseValue(value, platform: Platform) {
        // if (value instanceof Date) {
        //     return value.toISOString().substr(0, 10);
        // }

        // if (!value || value.toString().match(/^\d{4}-\d{2}-\d{2}$/)) {
        //     return value as string;
        // }

        // throw ValidationError.invalidType(DateType, value, 'JS');
        return value
    }

    convertToJSValue(value, platform: Platform) {
        // if (!value || value instanceof Date) {
        //     return value as Date;
        // }

        // const date = new Date(value);

        // if (date.toString() === 'Invalid Date') {
        //     throw ValidationError.invalidType(DateType, value, 'database');
        // }

        // return date;
        return value
    }

    getColumnType(prop: EntityProperty, platform: Platform) {
        // return `date(${prop.length})`;
        // return platform.getDateTypeDeclarationSQL(prop.length);
        // const a = platform.getSchemaHelper().getTypeDefinition(prop)
        // console.log('ID', a)
        return platform.getTimeTypeDeclarationSQL(13)
    }
}
const graphql = {
    description: `ObjectID`,
    parseValue(value) {
        return value
    },
    serialize(value) {
        return value
    },
    parseLiteral(ast) {
        return ast.value
        // if (ast.kind === Kind.INT) {
        //     return new Date(ast.value) // ast value is always in string format
        // }
        // return null;
    }
}

@CustomScalar()
export class ID {
    type: string
    static graphql = graphql
    static mikrorm = mikrormID
    static create = () => new ObjectId().toHexString()
}