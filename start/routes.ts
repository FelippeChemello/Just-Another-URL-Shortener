import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
    return { status: 'up' }
})

Route.post('/login', 'AuthController.login')
Route.post('/signup', 'AuthController.signup')

Route.post('/create', 'UrlShortenerController.create').middleware('auth')
Route.get('/go/:hash', 'UrlShortenerController.go')
