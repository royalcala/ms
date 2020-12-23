import { ClassType, getMetadataStorage, InputType, ObjectType } from "../src";
import { clone } from "ramda";
import { MetadataStorage } from "../src/metadata/metadata-storage";
import { inheritValidationMetadata } from "./inheritValidationMetadata";


export function PartialType<T>(
    classRef: ClassType<T>,
    type: 'ObjectType' | 'InputType',
): ClassType<Partial<T>> {
    abstract class PartialType { }
    const clonedFields = clone(
        getMetadataStorage().fields.filter(
            field => (field.target === classRef)
        )
    ) as MetadataStorage['fields']
    if (type === 'InputType')
        InputType({ isAbstract: true })(PartialType)
    else
        ObjectType({ isAbstract: true })(PartialType)


    const apiMetadataStorage = getMetadataStorage()
    clonedFields.forEach(
        item => {
            item.target = PartialType
            item.typeOptions = {
                ...item.typeOptions,
                nullable: true
            }
            apiMetadataStorage.collectClassFieldMetadata(item)
        });

    Object.defineProperty(PartialType, 'name', {
        value: `${classRef.name}PartialType`,
    });


    inheritValidationMetadata(classRef, PartialType)
    return PartialType as ClassType<Partial<T>>
}




