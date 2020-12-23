export function getResolver<T extends object, K extends keyof T>(o: T, methodKey: K) {
    const fx = o[methodKey] as any
    return fx.bind(o) as (...any)=>Promise<any>
}