/**
 * @author Syed Faruque
 * created: May 20 2024
**/

// library imports
const sql = require("mysql2");
require('dotenv').config();

// database connection
const connection = sql.createConnection({
    host: process.env.DATABASE_HOST, user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD, database: process.env.DATABASE_NAME
});

connection.connect(function(err) {
    if (err) {
        console.log("Could not establish database connection: " + err);
        return;
    }
    console.log("Database connection established");
});

// accounts table setup
connection.query(`
    CREATE TABLE IF NOT EXISTS accounts (
        username VARCHAR(255), password VARCHAR(255), 
        online_status BOOLEAN
    )
`, function(error, results, fields) {
    if (error) {
        console.log("Error creating accounts table: " + error);
    }
});

// socket_connections table setup
connection.query(`
    CREATE TABLE IF NOT EXISTS socket_connections (
        username VARCHAR(255), socket_id VARCHAR(255)
    )
`, function(error, results, fields) {
    if (error) {
        console.log("Error creating socket_connections table: " + error);
    }
});

// friends table setup
connection.query(`
    CREATE TABLE IF NOT EXISTS friends (
        user VARCHAR(255), friend VARCHAR(255)
    )
`, function(error, results, fields) {
    if (error) {
        console.log("Error creating friends table: " + error);
    }
});

// invites table setup
connection.query(`
    CREATE TABLE IF NOT EXISTS invites (
        inviter VARCHAR(255), invited VARCHAR(255),
        room_id VARCHAR(255)
    )
`, function(error, results, fields) {
    if (error) {
        console.log("Error creating invites table: " + error);
    }
});

// friend requests table setup
connection.query(`
    CREATE TABLE IF NOT EXISTS friend_requests (
        sender VARCHAR(255), receiver VARCHAR(255)
    )
`, function(error, results, fields) {
    if (error) {
        console.log("Error creating friend_requests table: " + error);
    }
});

// rooms table setup
connection.query(`
    CREATE TABLE IF NOT EXISTS rooms (
        player1_socket_id VARCHAR(255), player1_username VARCHAR(255),
        player2_socket_id VARCHAR(255), player2_username VARCHAR(255),
        full BOOLEAN, room_id VARCHAR(255)
    )
`, function(error, results, fields) {
    if (error) {
        console.log("Error creating rooms table: " + error);
    }
});

module.exports = connection;
