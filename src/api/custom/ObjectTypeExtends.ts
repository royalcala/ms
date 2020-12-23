import { getMetadataStorage } from "../src";

export function ObjectTypeExtends(Extends: () => Function): ClassDecorator {
    return (constructor: Function) => {
        getMetadataStorage().fields.find(
            (field, i) => {
                if (field.target === constructor)
                    field.target = Extends()
            })

    }
}
