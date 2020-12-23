import { createParamDecorator } from "../..";

export function Parent() {
    return createParamDecorator(
        ({ root }) => root)
}