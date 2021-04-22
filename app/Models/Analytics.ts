import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

import Url from 'App/Models/Url'

export default class Analytics extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public urlId: number

    @column()
    public ip: string

    @column()
    public userAgent: string

    @column()
    public country: string

    @column()
    public region: string

    @column()
    public timezone: string

    @column()
    public city: string

    @column()
    public latitude: number

    @column()
    public longitude: number

    @column()
    public browser: string

    @column()
    public browserEngine: string

    @column()
    public deviceType: string

    @column()
    public deviceModel: string

    @column()
    public deviceVendor: string

    @column()
    public os: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @belongsTo(() => Url)
    public Url: BelongsTo<typeof Url>
}
