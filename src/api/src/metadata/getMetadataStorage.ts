import { MetadataStorage } from "./metadata-storage";

export function getMetadataStorage(): MetadataStorage {
  return (
    //@ts-ignore
    global.TypeGraphQLMetadataStorage || (global.TypeGraphQLMetadataStorage = new MetadataStorage())
  );
}
