import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
    return { status: 'ok' }
})

Route.post('/login', 'AuthController.login')
Route.post('/signup', 'AuthController.signup')

Route.post('/create', 'UrlShortenerController.create').middleware('auth')
Route.post('/create/batch', 'UrlShortenerController.createBatch').middleware('auth')

Route.get('/go/:hash', 'UrlShortenerController.go')
Route.get('/:hash', 'UrlShortenerController.go')
