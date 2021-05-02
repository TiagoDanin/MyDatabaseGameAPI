const {v4: uuidv4} = require('uuid')
const mysql = require('mysql2/promise')

let connection

const connect = async () => {
	connection = await mysql.createConnection(`mysql://${process.env.MYSQLHOST}/gamedb`)
	console.log('[!] Database is ready!')
	connection.query(`
		USE gamedb;
	`)
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

	return rows
}

const createLogin = async (paramaters) => {
	const [rows] = await connection.query(`
	INSERT INTO gamedb.usuario (nome_de_usuario, password, nome, email)
		VALUES (?, ?, ?, ?);
	`, [
		paramaters.username,
		paramaters.password,
		paramaters.name ? paramaters.name : null,
		paramaters.email
	])

	return rows
}

const getOsGame = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT sistema_operacional.nome
		FROM gamedb.game, gamedb.game_sistema_operacional, gamedb.sistema_operacional
		WHERE game.id = ? AND
			game.id = game_sistema_operacional.game_id AND
			game_sistema_operacional.sistema_operacional_id = sistema_operacional.id;
	`, [paramaters.gameId])

	return rows
}

const getGendersGame = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT genero.nome
		FROM gamedb.game, gamedb.game_genero, gamedb.genero
		WHERE game.id = ? AND
			game.id = game_genero.game_id AND
			game_genero.genero_id = genero.id;
	`, [paramaters.gameId])

	return rows
}

const getDistributorGame = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT empresa.nome
		FROM gamedb.empresa, gamedb.distribuidora, gamedb.game
		WHERE game.id = ? AND
			game.id = distribuidora.game_id AND
			distribuidora.empresa_id = empresa.id;
	`, [paramaters.gameId])

	return rows
}

const getDeveloperGame = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT empresa.nome
		FROM gamedb.empresa, gamedb.desenvolvedor, gamedb.game
		WHERE game.id = ? AND
			game.id = desenvolvedor.game_id AND
			desenvolvedor.empresa_id = empresa.id;
	`, [paramaters.gameId])

	return rows
}

const getRateGame = async (paramaters) => {
	const [rows] = await connection.query(`SELECT fnObterNota(?) as nota;`, [paramaters.gameId])
	return rows[0]
}

const createComment = async (paramaters) => {
	const [rows] = await connection.query(`
	INSERT INTO gamedb.comentario (game_id, usuario_id, texto)
		VALUES (?, ?, ?);
	`, [paramaters.gameId, paramaters.userId, paramaters.text])

	return rows
}

const listCommentsGame = async (paramaters) => {
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

const getDistributorGames = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT game.*
		FROM gamedb.distribuidora, gamedb.game
		WHERE game.id = distribuidora.game_id AND
			distribuidora.empresa_id = 1;
	`, [paramaters.id])

	return rows
}

const getDeveloperGames = async (paramaters) => {
	const [rows] = await connection.query(`
	SELECT game.*
		FROM gamedb.desenvolvedor, gamedb.game
		WHERE game.id = desenvolvedor.game_id AND
			desenvolvedor.empresa_id = 1;
	`, [paramaters.id])

	return rows
}

const getBusinesses = async () => {
	const [rows] = await connection.query(`SELECT * FROM gamedb.empresa;`)
	return rows
}

const getAllGenders = async () => {
	const [rows] = await connection.query('SELECT * FROM gamedb.genero;')
	return rows
}

const getAllOs = async () => {
	const [rows] = await connection.query('SELECT * FROM gamedb.sistema_operacional;')
	return rows
}

const createBusiness = async (paramaters) => {
	const [rows] = await connection.query(`
		INSERT INTO gamedb.empresa (nome) VALUES (?);
	`, [paramaters.text])

	return rows
}

const createGender = async (paramaters) => {
	const [rows] = await connection.query(`
		INSERT INTO gamedb.genero (nome) VALUES (?);
	`, [paramaters.text])

	return rows
}

const createGame = async (paramaters) => {
	let gameId = 0;
	const {
		userId,
		name,
		description,
		releaseDate,
		steamId,
		genders,
		developers,
		distributions,
		os
	} = paramaters

	const [rows] = await connection.query(`
		INSERT INTO gamedb.game (nome, descricao, lacamento_data, steam_id)
			VALUES (?, ?, ?, ?);
	`, [name, description, releaseDate, steamId ? steamId : null])
	gameId = rows.insertId

	for (id of genders.split(',')) {
		await connection.query(`
			INSERT INTO gamedb.game_genero (game_id, genero_id) VALUES (?, ?);
		`, [gameId, id])
	}

	for (id of developers.split(',')) {
		await connection.query(`
			INSERT INTO gamedb.desenvolvedor (game_id, empresa_id) VALUES (?, ?);
		`, [gameId, id])
	}

	for (id of developers.split(',')) {
		await connection.query(`
			INSERT INTO gamedb.desenvolvedor (game_id, empresa_id) VALUES (?, ?);
		`, [gameId, id])
	}

	for (id of distributions.split(',')) {
		await connection.query(`
			INSERT INTO gamedb.distribuidora (game_id, empresa_id) VALUES (?, ?);
		`, [gameId, id])
	}

	for (id of os.split(',')) {
		await connection.query(`
			INSERT INTO gamedb.game_sistema_operacional (game_id, sistema_operacional_id) VALUES (?, ?);
		`, [gameId, id])
	}

	await connection.query(`
		INSERT INTO gamedb.game_editado_por (usuario_id, game_id) VALUES (?, ?);
	`, [userId, gameId])

	return rows
}

const sendRateGame = async (paramaters) => {
	const {
		gameId,
		userId,
		rate
	} = paramaters

	const [rows] = await connection.query(`
	SELECT nota FROM gamedb.nota
		WHERE usuario_id = ?
		AND game_id = ?;
	`, [userId, gameId])

	if (rows.length <= 0) {
		await connection.query(`
		INSERT INTO gamedb.nota (game_id, usuario_id, nota)
			VALUES (?, ?, ?);
		`, [gameId, userId, rate])
	} else {
		await connection.query(`
		UPDATE gamedb.nota
			SET nota = ?
			WHERE usuario_id = ?
			AND game_id = ?;
		`, [rate, userId, gameId])
	}

	return getRateGame(paramaters)
}

module.exports = {
	createGame,
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
	getSearchGames,
	isLoginValid,
	createLogin,
	getOsGame,
	getGendersGame,
	getDistributorGame,
	getDeveloperGame,
	getRateGame,
	createComment,
	createGender,
	listCommentsGame,
	getDistributorGames,
	getDeveloperGames,
	getBusinesses,
	createBusiness,
	getAllOs,
	sendRateGame
}
