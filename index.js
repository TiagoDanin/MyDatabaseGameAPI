
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const database = require('./database')

const port = process.env.PORT || 8000
const build = 1

app.set('trust proxy', 1)

// API
app.use('/api/', bodyParser.json())

let countRequests = 0 
app.use('/api/', (request, response, next) => {
	console.log(`[.] New API Request (${++countRequests}): ${Date.now().toString()}`)
	next()
})

app.get('/', (request, response) => response.send('Hello World!'))

app.get(`/api/v${build}/`, (request, response) => response.json({isOk: true}))

// API Generic

app.get(`/api/v${build}/version/`, (request, response) => {
	console.log('[+] Check version')

	response.json({
		isOk: true,
		apiVersion: "0.0.1",
		apiBuild: 1
	})
})

app.use('/api/', (request, response, next) => {
	const error = new Error(`Not found: ${request.originalUrl}`)
	next(error)
})

app.use('/api/', (error, request, response, next) => {
	let statusCode = request.statusCode === 200 ? 500 : (request.statusCode || 500)
	console.error('[!] Error API', error.stack)
	
	if (error.message.includes("Not found")) {
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
