import { createParamDecorator } from "../src";
import { Context } from "../custom/Context";

export default function user() {
  return createParamDecorator<Context>(({ context }) => context.user);
}
