import { Type, Platform, EntityProperty, DateType } from '@mikro-orm/core';
import { Kind } from 'graphql';
import { CustomScalar } from './CustomScalar.abstract';

class mikrormDateTime extends Type<number, number> {
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
    description: `timestamp`,
    parseValue(value) {
        return value
        // return new Date(value); // value from the client
    },
    serialize(value) {
        return value
        // return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
        return ast.value
        // if (ast.kind === Kind.INT) {
        //     return ast.value
        //     // return new Date(ast.value) // ast value is always in string format
        // }
        return null;
    }
}

@CustomScalar()
export class DateTime {
    type: number
    static graphql = graphql
    static mikrorm = mikrormDateTime
    static create = () => Date.now()
}
// export class DateTime extends CustomScalar({
//     graphql,
//     mikrorm: DateTimeType
// }) { }