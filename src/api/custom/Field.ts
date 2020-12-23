// import { TCustomScalar } from "../../scalars/CustomScalar.abstract";
// import { Field as TypeField, FieldOptions } from "../src";
// import { MethodAndPropDecorator, ReturnTypeFunc } from "../src/decorators/types";

// export function Field(): MethodAndPropDecorator;
// export function Field(options: FieldOptions): MethodAndPropDecorator;
// export function Field(
//     returnTypeFunction?: ReturnTypeFunc,
//     options?: FieldOptions,
// ): MethodAndPropDecorator;
// export function Field(
//     returnTypeFuncOrOptions?: ReturnTypeFunc | FieldOptions,
//     maybeOptions?: FieldOptions,
// ): MethodDecorator | PropertyDecorator {
//     return (target, key) => {
//         if (returnTypeFuncOrOptions !== undefined)
//             if (typeof returnTypeFuncOrOptions === 'function')
//                 return TypeField(returnTypeFuncOrOptions as any, maybeOptions)(target, key)

//         const Scalar = Reflect.getMetadata("design:type", target, key) as TCustomScalar
//         return TypeField(() => Scalar.graphql, returnTypeFuncOrOptions as FieldOptions)(target, key)

//     }
// }