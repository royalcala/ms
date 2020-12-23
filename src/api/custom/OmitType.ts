import { ClassType, getMetadataStorage, InputType, ObjectType } from "..";
import { inheritValidationMetadata } from "./inheritValidationMetadata";
import { clone } from "ramda";
import { MetadataStorage } from "../src/metadata/metadata-storage";



export function OmitType<T, K extends keyof T >(
    classRef: ClassType<T>,
    omit: K[],
    type: 'ObjectType' | 'InputType',
) {
    abstract class OmitType { }

    const clonedFields = clone(
        getMetadataStorage().fields.filter(
            field => (field.target === classRef && !omit.includes(field.name as any))
        )
    ) as MetadataStorage['fields']
    if (type === 'InputType')
        InputType({ isAbstract: true })(OmitType)
    else
        ObjectType({ isAbstract: true })(OmitType)


    const apiMetadataStorage = getMetadataStorage()
    clonedFields.forEach(
        item => {
            item.target = OmitType
            item.typeOptions = item.typeOptions
            apiMetadataStorage.collectClassFieldMetadata(item)
        });

    Object.defineProperty(OmitType, 'name', {
        value: `${classRef.name}OmitType`,
    });

    inheritValidationMetadata(classRef, OmitType)
    return OmitType as ClassType<Omit<T, typeof omit[number]>>
}



// export interface MappedType<T> extends ClassType<T> {
//     new(): T;
// }

// export function inheritPropertyInitializers(
//     target: Record<string, any>,
//     sourceClass: ClassType<any>,
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     isPropertyInherited = (key: string) => true,
// ) {
//     try {
//         const tempInstance = new sourceClass();
//         const propertyNames = Object.getOwnPropertyNames(tempInstance);

//         propertyNames
//             .filter(
//                 (propertyName) =>
//                     typeof tempInstance[propertyName] !== 'undefined' &&
//                     typeof target[propertyName] === 'undefined',
//             )
//             .filter((propertyName) => isPropertyInherited(propertyName))
//             .forEach((propertyName) => {
//                 target[propertyName] = tempInstance[propertyName];
//             });
//     } catch { }
// }

// export function OmitType<T, K extends keyof T>(
//     classRef: ClassType<T>,
//     keys: readonly K[],
// ): MappedType<Omit<T, typeof keys[number]>> {
//     const isInheritedPredicate = (propertyKey: string) =>
//         !keys.includes(propertyKey as K);

//     abstract class OmitClassType {
//         constructor() {
//             inheritPropertyInitializers(this, classRef, isInheritedPredicate);
//         }
//     }

//     inheritValidationMetadata(classRef, OmitClassType, isInheritedPredicate);
//     //   inheritTransformationMetadata(classRef, OmitClassType, isInheritedPredicate);

//     return OmitClassType as MappedType<Omit<T, typeof keys[number]>>;
// }