import { FilterQuery } from "../../..";
import { Api, Scalar } from "../../../..";

// @Api.Arg('filter', () => Scalar.Json.graphql) filter: FilterQuery < any > = { },
export function Filter() {

    return (prototype, propertyKey, parameterIndex) => {
        Api.Arg('filter', () => Scalar.Json.graphql)(prototype, propertyKey, parameterIndex)
    }

}

// Filter.type = {} as FilterQuery<any>


// export { Filter }