import { createParamDecorator } from "../..";
import { Context } from "../../custom";

export function RequestId() {
    return createParamDecorator(
        ({ context }: { context: Context }) => {
            return context?.requestId
        })
}