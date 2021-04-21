import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Urls extends BaseSchema {
    protected tableName = 'urls'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table
                .integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.string('long_url')
            table.string('short_url')
            table.string('short_url_hash').unique()
            table.timestamps(true, true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
