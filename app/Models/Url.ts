import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

import User from './User'
import Analytics from './Analytics'

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

    @belongsTo(() => User)
    public user: BelongsTo<typeof User>

    @hasMany(() => Analytics)
    public analytics: HasMany<typeof Analytics>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
