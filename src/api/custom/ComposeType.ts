import { PartialType } from "./PartialType";
import { OmitType } from "./OmitType";
import { ClassType } from "..";
/**
 * Example ComposeType(ClassRef,'inputType').PartialType().OmitType(['parts'])
 */
export function ComposeType<T>(
    classRef: ClassType<T>,
    type: 'ObjectType' | 'InputType',
) {
    let StoreClass
    return {
        PartialType() {
            StoreClass = PartialType(classRef, type)
            return StoreClass
        },
        OmitType() {
            return this
        },
        getClass() {

        }
    }
}