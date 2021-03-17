const {v4: uuidv4} = require('uuid')
const mysql = require("mysql2/promise")

let connection;

const connect = async () => {
	connection = await mysql.createConnection("mysql://root:password@localhost:3306/gamedb");
	console.log("[!] Database is ready!")
}

const getAllGames = async () => {
	const [rows] = await connection.query('SELECT * FROM game;');
    return rows;
}

module.exports = {
	connect,
	getAllGames
}
