const {v4: uuidv4} = require('uuid')
const mysql = require('mysql2/promise')

let connection

const connect = async () => {
	connection = await mysql.createConnection(`mysql://${process.env.MYSQLHOST}/gamedb`)
	console.log('[!] Database is ready!')
}

const getAllGames = async () => {
	const [rows] = await connection.query('SELECT * FROM game;')
	return rows
}

const getAllUsers = async () => {
	const [rows] = await connection.query('SELECT  *FROM usuario;')
	return rows
}

const getAllGamesSoon = async () => {
	const [rows] = await connection.query(`
	SELECT *
		FROM gamedb.game
		WHERE lacamento_data >= current_date()
		ORDER BY lacamento_data ASC;
	`)

	return rows
}

module.exports = {
	connect,
	getAllGames,
	getAllUsers,
	getAllGamesSoon
}
