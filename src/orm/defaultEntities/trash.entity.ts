import { JsonType } from "@mikro-orm/core"
import { Db } from "../.."



export class Trash {

    @Db.Property()
    _id: string


    @Db.Property({type:JsonType})
    body: JSON
}