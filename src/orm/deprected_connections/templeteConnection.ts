export const storeTemplateConnections = []


export function TempleteConnection() {
    return (constructor) => {
        storeTemplateConnections.push(constructor)
    }
}