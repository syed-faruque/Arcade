/**
 * @author Syed Faruque
 * created: May 20 2024
**/

//library imports
const express = require("express");
const http = require("http");
const io = require("socket.io");
require('dotenv').config();

//server setup
const app = express();
const server = http.createServer(app);
const socketIO = io(server, {cors: {origin: "http://localhost:5173", methods: ["GET", "POST"]}});

//socketHandlers import
const socketHandlers = require('./socketHandlers');

//socket event handlers
socketHandlers(socketIO);

//makes server listen on designated port
server.listen(process.env.PORT, () => {
        console.log("Server running");
});