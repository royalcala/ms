import { ClassType } from '..';

export function inheritValidationMetadata(
    parentClass: ClassType<any>,
    targetClass: Function,
    isPropertyInherited?: (key: string) => boolean,
) {
    // if (!isClassValidatorAvailable()) {
    //   return;
    // }
    try {
        const classValidator: typeof import('class-validator') = require('class-validator');
        const metadataStorage: import('class-validator').MetadataStorage = (classValidator as any)
            .getMetadataStorage
            ? (classValidator as any).getMetadataStorage()
            : classValidator.getFromContainer(classValidator.MetadataStorage);

        const targetMetadata = metadataStorage.getTargetValidationMetadatas(
            parentClass,
            null!,
        );
        return targetMetadata
            .filter(
                ({ propertyName }) =>
                    !isPropertyInherited || isPropertyInherited(propertyName),
            )
            .map((value) => {
                metadataStorage.addValidationMetadata({
                    ...value,
                    target: targetClass,

                });
                return value.propertyName;
            });
    } catch (err) {
        new Error(`Validation ("class-validator") metadata cannot be inherited for "${parentClass.name}" class.${err}`)
        //   logger.error(
        //     `Validation ("class-validator") metadata cannot be inherited for "${parentClass.name}" class.`,
        //   );
        //   logger.error(err);
    }
}