
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const database = require('./database')
database.connect()

const port = process.env.PORT || 8000
const build = 1

const errorHandler = (response, error) => {
	console.error('[!] Error', error)
	response.status(500).json({
		isOk: false,
		error: {
			code: 500,
			message: error.message || '',
			stack: process.env.NODE_ENV === 'production' ? {} : (error.stack || {})
		},
		data: {}
	})
}

app.set('trust proxy', 1)

app.use('/api/', bodyParser.json())

let countRequests = 0
app.use('/api/', (request, response, next) => {
	console.log(`[.] New API Request (${++countRequests}): ${Date.now().toString()}`)
	next()
})

app.get('/', (request, response) => response.send('Hello World!'))

app.get(`/api/v${build}/`, (request, response) => response.json({isOk: true}))

app.get(`/api/v${build}/version/`, (request, response) => {
	console.log('[+] Check version')

	response.json({
		isOk: true,
		apiVersion: '0.0.1',
		apiBuild: 1
	})
})

app.get(`/api/v${build}/games/`, (request, response) => {
	console.log('[+] List all games')

	database.getAllGames().then(result => {
		response.json({
			isOk: true,
			data: result
		})
	}).catch(error => errorHandler(response, error))
})

app.get(`/api/v${build}/games/soon`, (request, response) => {
	console.log('[+] List all games (release)')

	database.getAllGamesSoon().then(result => {
		response.json({
			isOk: true,
			data: result
		})
	}).catch(error => errorHandler(response, error))
})

app.get(`/api/v${build}/users/`, (request, response) => {
	console.log('[+] List all users')

	database.getAllUsers().then(result => {
		response.json({
			isOk: true,
			data: result
		})
	}).catch(error => errorHandler(response, error))
})

app.use('/api/', (request, response, next) => {
	const error = new Error(`Not found: ${request.originalUrl}`)
	next(error)
})

app.use('/api/', (error, request, response, next) => {
	let statusCode = request.statusCode === 200 ? 500 : (request.statusCode || 500)
	console.error('[!] Error API', error.stack)

	if (error.message.includes('Not found')) {
		statusCode = 404
	}

	response.status(statusCode).json({
		isOk: false,
		error: {
			code: statusCode,
			message: error.message || '',
			stack: process.env.NODE_ENV === 'production' ? {} : (error.stack || {})
		},
		data: {}
	})
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
