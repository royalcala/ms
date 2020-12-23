import { validate } from "../.."
import { ArgumentValidationError, ResolverData } from "../../../api"
import { path } from 'ramda'

export function ValidateInstance(pathToInstances: string[]) {
    const validateInstance = async (data: ResolverData<any>, next) => {
        let promises = []
        let errorsValidate = []
        // let instances = data.context.insertMany.instances
        //need to be with his instance Validator Class the docs before
        const docs = path<object[]>(pathToInstances, data)//data.args.docs
        for (let index = 0; index < docs.length; index++)
            promises.push(
                (async () => {
                    const validationErrors = await validate(docs[index])
                    if (validationErrors.length > 0)
                        errorsValidate.push(validationErrors)
                })()
            )
        await Promise.all(promises)
        if (errorsValidate.length > 0)
            throw new ArgumentValidationError(errorsValidate);
        else
            return next()
    }
    return validateInstance
}