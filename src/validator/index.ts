export * from 'class-validator'
export * from './api/middlewares'
// export * from './api/decorators'
// export { ValidateInstance } from './api/middlewares/validateInstance'
// export { ValidateDocs, ValidateDocsSync } from './apiMiddlewares/validateDocs'


// import { validateOrReject as class_validateOrReject, ValidatorOptions } from "class-validator"
// export function validateOrReject(schema: string | Function, objects: Object[], validatorOptions?: ValidatorOptions): Promise<void[]> {
//     if (typeof schema === 'function')
//         schema = schema.name

//     return Promise.all(objects.map(
//         object => class_validateOrReject(schema as string, object, validatorOptions)
//     )
//     )
// }