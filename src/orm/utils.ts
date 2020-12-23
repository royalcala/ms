import { EntityManager } from "@mikro-orm/core";
import { ClassType, ResolverData2 } from "../api";

export const getPrimaryKey = (
    db:EntityManager,
    Entity: ClassType
) => db.getMetadata().get(Entity.name).primaryKeys[0]