import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Url extends BaseModel {
    @column({ isPrimary: true, serializeAs: null })
    public id: number

    @column({ serializeAs: null })
    public userId: number

    @column()
    public longUrl: string

    @column()
    public shortUrl: string

    @column({ serializeAs: null })
    public shortUrlHash: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
