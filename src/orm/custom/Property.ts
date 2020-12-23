import { Property as PropertySrc, PropertyOptions } from '@mikro-orm/core';
// import { TCustomScalar } from '../../scalars/CustomScalar.abstract';

/**
 * 
 * @param param0 PropertyOptions with defaults nullable=true
 */
export const Property = <T>({ nullable = true, ...others }: PropertyOptions<T> = {}): PropertyDecorator => {
    return (target, key: string) => {
        // if (!others?.type) {
        //     const Scalar = Reflect.getMetadata("design:type", target, key) as TCustomScalar
        //     others.type = Scalar.mikrorm
        // }
        PropertySrc({
            nullable,
            ...others
        })(target, key)
    }

}
