import { CreatePersist } from ".."
import { ValidateInstance } from "../../../../validator"
import { CreatePersistNestedAndPopulate } from "./CreatePersist"
import { DefaultProps } from "./DefaultProps"
import { ConfigMutation, MutationAbstract } from "./Mutation.abstract"

function insertMiddlwares() {
    const config = this.config as ConfigMutation<any, any>
    return config.defaultPropsFx
        ?
        [
            ValidateInstance(config.path_to_docs),
            DefaultProps(
                config.path_to_docs,
                config.defaultPropsFx
            ),
            CreatePersist(config.entity, config.path_to_docs)
        ]
        :
        [
            ValidateInstance(config.path_to_docs),
            CreatePersist(config.entity, config.path_to_docs)
        ]
}
export const Insert = MutationAbstract(insertMiddlwares)


type ConfigNested = {
    nestedPath: string[]
}

const insertNestedMiddlewares = (configNested: ConfigNested) => function insertNested() {
    const config = this.config as ConfigMutation<any, any>
    return [
        CreatePersistNestedAndPopulate({
            Entity: config.entity,
            defaultPropsFx: config.defaultPropsFx,
            nestedPath: configNested.nestedPath,
            pathToDocs: config.path_to_docs
        }
        )
    ]
}

export const InsertNested = (configNested: ConfigNested) => MutationAbstract(
    insertNestedMiddlewares(configNested)
)