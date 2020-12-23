import assert from "assert";
// import { createConnection, getRepository, Entity, PrimaryColumn, Column, Connection } from "../db/src";
import { createConnection, getRepository, Entity, PrimaryColumn, Column, Connection } from "typeorm";
@Entity()
class _User {
    @PrimaryColumn()
    id?: number

    @Column({ nullable: true })
    name?: string

    @Column({ nullable: true })
    lastname?: string

    @Column({ nullable: true })
    age?: number
}

@Entity()
class Metadata {
    @PrimaryColumn()
    id?: number

    @Column({ nullable: true })
    name?: string

    @Column({ nullable: true })
    lastname?: string

    @Column({ nullable: true })
    age?: number
}

describe("TypeOrm", () => {
    let connection: Connection
    it("start create connection", async () => {
        connection = await createConnection({
            type: 'sqlite',
            database: __dirname + '/typeorm-test.sqlite',
            entities: [_User, Metadata]
        });
        console.log('sync')
        await connection.synchronize(true)
    })
    it("insert", async () => {
        const user1 = new _User()
        user1.id = 1
        user1.name = 'Roy'
        const user2 = new _User()
        user2.id = 2
        user2.name = 'Allia'
        const userRepository = getRepository(_User)
        await userRepository.save([user1, user2])
    })

})