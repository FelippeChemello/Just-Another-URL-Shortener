import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Url from 'App/Models/Url'
import md5 from 'md5'

const minimumHashLength = 3
const maximumHashLength = 7
const maximumRounds = 5
const defaultUrl = process.env.API_URL

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

        try {
            const urlHash = await this.generateHash(longUrl)

            const url = await user
                ?.related('urls')
                .create({ longUrl, shortUrlHash: urlHash, shortUrl: `${defaultUrl}${urlHash}` })

            return url.serialize()
        } catch {
            return response.internalServerError({
                error: 'An error occurred during your request, try again later.',
            })
        }
    }

    public async go({ params, response }: HttpContextContract) {
        const urlHash = params.hash

        try {
            const url = await Url.findByOrFail('short_url_hash', urlHash)

            response.redirect(url.longUrl)
        } catch (e) {
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
