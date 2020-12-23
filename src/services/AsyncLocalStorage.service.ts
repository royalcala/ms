import { AsyncLocalStorage } from "async_hooks";


export const asyncLocalStorage = new AsyncLocalStorage<{
    context: {
        requestId: number,
        user: {
            id: number
        }
    }
}>()