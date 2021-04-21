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

const getAllGamesByGender = async (paramaters) => {
	if (!paramaters.genderId) {
		return getAllGames()
	}

	const [rows] = await connection.query(`
		SELECT game.*
			FROM gamedb.game, gamedb.game_genero
			WHERE game.id = game_genero.game_id AND game_genero.genero_id = ?;
	`, [paramaters.genderId])
	return rows
}

const getAllGenders = async () => {
	const [rows] = await connection.query('SELECT * FROM genero;')
	return rows
}

const getAllUsers = async () => {
	const [rows] = await connection.query('SELECT * FROM usuario;')
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

const getAllGamesTop = async () => {
	const [rows] = await connection.query(`
	SELECT game.*,
		(SELECT ((SUM(nota) / 3) / COUNT(*)) # 1 = Não gostei, 2 = Neutro, 3 = Gostei
			FROM gamedb.nota
			WHERE game.id = nota.game_id) AS nota_geral
		FROM gamedb.game
		ORDER BY nota_geral DESC
		LIMIT 5;
	`)
	return rows
}

const getAllUsersTops = async () => {
	const [rows] = await connection.query(`
	SELECT usuario.*,
		(SELECT COUNT(*)
			FROM gamedb.comentario, gamedb.game
			WHERE
				comentario.usuario_id = usuario.id AND
				comentario.game_id = game.id) AS total
		FROM gamedb.usuario
		ORDER BY total DESC
		LIMIT 5;
	`)
	return rows
}

const getAllGamesTopComments = async () => {
	const [rows] = await connection.query(`
	SELECT game.*,
		(SELECT COUNT(*)
			FROM gamedb.comentario
			WHERE comentario.game_id = game.id) AS total
		FROM gamedb.game
		ORDER BY total DESC
		LIMIT 5;
	`)
	return rows
}

const getUserComments = async () => {
	const [rows] = await connection.query(`
	SELECT
		comentario.id,
		comentario.texto,
		game.nome
		FROM gamedb.comentario, gamedb.game
		WHERE
			comentario.usuario_id = 1 AND
			comentario.game_id = game.id;
	`)
	return rows
}

const getGameComments = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT
		comentario.id,
		comentario.texto,
		usuario.nome_de_usuario AS nome
		FROM gamedb.comentario, gamedb.usuario
		WHERE
			comentario.game_id = ? AND
			usuario.id = comentario.usuario_id;
	`, [paramaters.gameId])
	return rows
}


const getSearchGames = async (paramaters) => {
	const text = `%${paramaters.text}%`
	const [rows] = await connection.query(`
	SELECT 	*
		FROM gamedb.game
		WHERE nome LIKE ?;
	`, [text])

	return rows
}

const isLoginValid = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT *
		FROM gamedb.usuario
		WHERE nome_de_usuario = ? AND password = ?;
	`, [paramaters.username, paramaters.password])

	return rows.length == 1
}

module.exports = {
	connect,
	getAllGames,
	getAllUsers,
	getAllGamesSoon,
	getAllGenders,
	getAllGamesByGender,
	getAllGamesTop,
	getAllUsersTops,
	getAllGamesTopComments,
	getUserComments,
	getGameComments,
	getSearchGames,
	isLoginValid
}
