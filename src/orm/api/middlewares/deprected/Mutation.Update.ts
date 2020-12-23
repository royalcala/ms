import { ValidateInstance } from "../../../../validator"
import { DefaultProps } from "./DefaultProps"
import { ConfigMutation, MutationAbstract } from "./Mutation.abstract"
import { FindAndPersistUpdate } from "../Update.findAndPersist"

function UpdateMiddlwares() {
    const config = this.config as ConfigMutation<any, any>
    return config?.defaultPropsFx
        ?
        [
            ValidateInstance(config.path_to_docs),
            DefaultProps(
                config.path_to_docs,
                config.defaultPropsFx
            ),
            FindAndPersistUpdate(
                config.entity,
                config.path_to_docs
            )
        ]
        :
        [
            ValidateInstance(config.path_to_docs),
            FindAndPersistUpdate(
                config.entity,
                config.path_to_docs
            )
        ]
}

export const Update = MutationAbstract(UpdateMiddlwares)
