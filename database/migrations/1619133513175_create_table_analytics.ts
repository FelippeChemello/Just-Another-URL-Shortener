import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Analytics extends BaseSchema {
    protected tableName = 'analytics'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('url_id').unsigned().references('id').inTable('urls').onDelete('CASCADE')
            table.string('ip')
            table.string('user_agent')
            table.string('country')
            table.string('region')
            table.string('timezone')
            table.string('city')
            table.float('latitude')
            table.float('longitude')
            table.string('browser')
            table.string('browser_engine')
            table.string('device_type')
            table.string('device_model')
            table.string('device_vendor')
            table.string('os')
            table.timestamps(true, true)
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
