import { wrap, Entity, MikroORM, PrimaryKey, Property, ReflectMetadataProvider } from '@mikro-orm/core';
import assert from "assert";
let increment = 0
@Entity()
class _User {
    @PrimaryKey()
    id: number = ++increment

    @Property({ nullable: true })
    name?: string

    @Property({ nullable: true })
    lastname?: string

    @Property({ nullable: true })
    age?: number
    constructor(data: Omit<_User, 'id'>) {
        Object.assign(this, data)
    }
}

describe("mikro-orm", () => {
    let orm: MikroORM
    it("start", async () => {
        orm = await MikroORM.init({
            metadataProvider: ReflectMetadataProvider,
            cache: { enabled: false },
            entities: [_User],
            type: 'sqlite',
            dbName: __dirname + "/data/data.db",
            baseDir: __dirname,
            // debug: true,
            batchSize: 500
        })
        const generator = orm.getSchemaGenerator();
        await generator.dropSchema();
        await generator.createSchema();
        await generator.updateSchema();


    })
    it('insert', async () => {
     
        let many = []
        for (let index = 0; index < 10; index++) {
            many.push(new _User({
                name: 'roy' + index
            }))
        }
        await orm.em.persistAndFlush(many)
      
    }).timeout(10000)
    // it('update many', async () => {
    //     const input = [{ id: '1', lastname: 'alcala1' }, { id: '2', lastname: 'alcala2' }, { id: '3', lastname: 'not in database' }]
    //     const find = await orm.em.find(_User, input.map(doc => doc.id))
    //     console.log({ find })
    //     const unitOfWork = orm.em.getUnitOfWork()
    //     console.log(unitOfWork.getById(_User.name, '1'))
    //     orm.em.getUnitOfWork().getById(_User.name, '1' as any)
    //     // const ref = orm.em.getReference(_User, '3')
    //     // console.log({ ref }, ref instanceof _User)
    //     let notFound = []
    //     input.forEach(
    //         doc => {
    //             let pointer = unitOfWork.getById<_User>(_User.name, doc.id)
    //             if (pointer)
    //                 orm.em.assign(pointer, doc)
    //             else
    //                 notFound.push(doc)
    //         }
    //     )
    //     let withError = false
    //     if (notFound.length > 0)
    //         withError = true
    //     else
    //         await orm.em.flush()
    //     assert.strictEqual(withError, true)
    // })


})