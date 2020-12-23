import { PrimaryKeyOptions, AnyEntity, PrimaryKey as PrimaryKeySrc } from "@mikro-orm/core";
import { TCustomScalar } from "../../scalars/CustomScalar.abstract";


// export function PrimaryKey<T>(options?: PrimaryKeyOptions<T>): (target: AnyEntity<any>, propertyName: string) => any;

export function PrimaryKey<T>(options: PrimaryKeyOptions<T> = {}) {
    return (target, propertyName) => {
        // if (!options?.type) {
        //     const Scalar = Reflect.getMetadata("design:type", target, propertyName) as TCustomScalar
        //     options.type = Scalar.mikrorm
        // }
        PrimaryKeySrc(options)(target, propertyName)
    }
}