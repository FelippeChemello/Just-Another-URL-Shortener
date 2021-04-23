import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Url from 'App/Models/Url'
import md5 from 'md5'
import geoip from 'geoip-lite'
import UserAgentParser from 'ua-parser-js'

const minimumHashLength = 3
const maximumHashLength = 7
const maximumRounds = 5
const defaultUrl = process.env.API_URL

interface InterfaceGeoIpLocation {
    country: string | undefined
    region: string | undefined
    timezone: string | undefined
    city: string | undefined
    ll: number[] | undefined
}

export default class UrlShortenerController {
    public async create({ request, response, auth }: HttpContextContract) {
        const user = auth.user

        if (!user) {
            return response.unauthorized({ error: 'You must be logged in to use this resource' })
        }

        const longUrl = request.input('long_url')

        if (!longUrl) {
            return response.badRequest({ error: 'long_url is mandatory' })
        }

        let urlHash = request.input('hash')
        try {
            if (!urlHash) {
                urlHash = await this.generateHash(longUrl)
            }
        } catch {
            return response.internalServerError({
                error: 'An error occurred during your request, try again later.',
            })
        }

        try {
            const url = await user
                ?.related('urls')
                .create({ longUrl, shortUrlHash: urlHash, shortUrl: `${defaultUrl}go/${urlHash}` })

            return url.serialize()
        } catch {
            return response.badRequest({
                error: 'Hash is not available',
            })
        }
    }

    public async createBatch({ request, response, auth }: HttpContextContract) {
        const user = auth.user

        if (!user) {
            return response.unauthorized({ error: 'You must be logged in to use this resource' })
        }

        const urls = request.input('urls') as { long_url?: string; hash?: string }[]

        if (!urls || urls.length < 1) {
            return response.internalServerError({
                error: 'Urls is mandatory',
            })
        }

        const shortedUrlsPromises = urls.map(({ hash, long_url: longUrl }) => {
            return new Promise(async (resolve) => {
                if (!longUrl) {
                    resolve({
                        url: { hash, longUrl },
                        status: 'failed',
                        error: 'long_url is mandatory',
                    })
                    return
                }

                if (!hash) {
                    hash = await this.generateHash(longUrl)
                }

                try {
                    const url = await user.related('urls').create({
                        longUrl,
                        shortUrlHash: hash,
                        shortUrl: `${defaultUrl}go/${hash}`,
                    })

                    resolve({ url: url.serialize(), status: 'ok' })
                } catch {
                    resolve({
                        url: { hash, longUrl },
                        status: 'failed',
                        error: 'Hash is not available',
                    })
                }
            })
        })

        return await Promise.all(shortedUrlsPromises)
    }

    public async go({ params, response, request }: HttpContextContract) {
        const urlHash = params.hash

        const ip = request.header('X-Real-IP') || 'Unknown'
        const location = geoip.lookup(ip) as InterfaceGeoIpLocation
        const { browser, device, engine: browserEngine, ua: userAgent, os } = new UserAgentParser(
            request.headers()['user-agent']
        ).getResult()

        const country = location?.country || 'Unknown'
        const region = location?.region || 'Unknown'
        const timezone = location?.timezone || 'Unknown'
        const city = location?.city || 'Unknown'
        const latitude = location?.ll ? location.ll[0] : 0
        const longitude = location?.ll ? location.ll[1] : 0
        const deviceType = device.type || 'Unknown'
        const deviceModel = device.model || 'Unknown'
        const deviceVendor = device.vendor || 'Unknown'

        try {
            const url = await Url.findByOrFail('short_url_hash', urlHash)

            await url.related('analytics').create({
                ip,
                userAgent,
                country,
                region,
                timezone,
                city,
                latitude,
                longitude,
                browser: browser.name || 'Unknown',
                browserEngine: browserEngine.name || 'Unknown',
                deviceModel,
                deviceType,
                deviceVendor,
                os: os.name || 'Unknown',
            })

            response.redirect(url.longUrl)
        } catch (e) {
            console.error(e)
            return response.notFound()
        }
    }

    private async generateHash(string: string, length = minimumHashLength, round = 0) {
        const hash = md5(string)

        const smallHash = hash.substr(hash.length - length)

        const url = await Url.findBy('short_url_hash', smallHash)

        if (url) {
            const insertPosition = Math.floor(Math.random() * string.length + 1)
            const newStringToHash = `${string.substr(0, insertPosition)}${smallHash}${string.substr(
                insertPosition
            )}`

            const newLength = length >= maximumHashLength ? minimumHashLength : length + 1
            const newRound = length >= maximumHashLength ? round + 1 : 1

            if (newRound > maximumRounds) {
                throw new Error('Maximum rounds exceeded')
            }

            return this.generateHash(newStringToHash, newLength, newRound)
        }

        return smallHash
    }
}
