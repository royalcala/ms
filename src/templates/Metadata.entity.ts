import { Api, Db, Scalar } from "..";
// import { TempleteConnection } from "../orm/connections/templeteConnection";
import { EntityTemplate } from "../orm/metadata/entity.metadata";
import { ClassTypesWithScalars } from "../scalars/CustomScalar.abstract";
@Api.ObjectType({ isAbstract: true })
@EntityTemplate()
export abstract class Metadata {
    @Db.PrimaryKey()
    @Api.Field()
    _id: string

    @Db.Property()
    @Api.Field()
    user_created: string

    @Db.Property({ type: Scalar.DateTime.mikrorm })
    @Api.Field(() => Scalar.DateTime.graphql)
    date_created: number ///Scalar.DateTime // = Date.now() as any

    @Db.Property()
    @Api.Field()
    user_updated: string

    @Db.Property({ type: Scalar.DateTime.mikrorm })
    @Api.Field(() => Scalar.DateTime.graphql)
    date_updated: number// Scalar.DateTime // = Date.now() as any

    //TODO history will be other nested layer
}

export type TMetadata = ClassTypesWithScalars<Metadata>