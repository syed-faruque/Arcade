/**
 * @author Syed Faruque
 * created: May 20 2024
**/

//~~~~~~~~~~~~~~~ contains all backend socket handling ~~~~~~~~~~~~~~~//

//library imports
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;
const connection = require('./dbSetup');

//helper functions import
const helpers = require('./helpers');

//socket event handlers
module.exports = (io) => {
    
        const helperFunctions = helpers(io);
        io.on("connection", (socket) => {

                //signup event handler
                socket.on("signup", (data) => {
                        connection.query("SELECT * FROM accounts WHERE username = ?", [data.username], (error, results) => {
                                if (error) {
                                        console.log("Error selecting from accounts table: "+error);
                                        return;
                                }
                                if (results.length > 0) {
                                        socket.emit("signup_results", false);
                                } 
                                else {
                                        connection.query("INSERT INTO accounts (username, password, online_status) VALUES (?,?,?)", [data.username, data.password, false], (error, results) => {
                                                if (error) {
                                                        console.error("Error inserting into accounts table: "+error);
                                                        return;
                                                }
                                                socket.emit("signup_results", true);
                                        });
                                }
                        });
                })
    
                //login event handler
                socket.on("login", (data) => {
                        connection.query("SELECT * FROM accounts WHERE username = ? AND password = ?", [data.username, data.password], (error, results) => {
                                if (error) {
                                        console.log("error selecting from accounts table: "+error);
                                        return;
                                }
                                if (results.length > 0) {
                                        const username = results[0].username;
                                        const token = jwt.sign({username: username}, process.env.TOKEN_SECRET);
                                        helperFunctions.updateUserOnlineStatus(username, true);
                                        helperFunctions.insertSocketMapping(username, socket.id);
                                        socket.emit("login_results", {success: true, token: token});
                                }
                                else {
                                        socket.emit("login_results", {success: false});
                                }
                        })
                })
    
                //find user statuses event handler
                socket.on("find_statuses", () => {
                        helperFunctions.fetchAndEmitUserStatuses(socket.username);
                        helperFunctions.updateUserStatusesToFriends(socket.username);
                })
    
                //send invite event handler
                socket.on("send_invite", (data) => {
                        const room_id = uuid();
                        connection.query("INSERT INTO invites (inviter, invited, room_id) values (?,?,?)", [socket.username, data.user, room_id], (error, results) => {
                        if (error) {
                                console.log("Error inserting into invites table: "+error)
                                return;
                        }
                                connection.query("INSERT INTO rooms (room_id) VALUES (?)", [room_id], (error, results) => {
                                        if (error) {
                                                console.log("Error inserting into rooms table: "+error);
                                                return;
                                        }
                                        helperFunctions.fetchAndEmitUserInvites(data.user);
                                        helperFunctions.fetchAndEmitInvitedUsers(socket.username);
                                })
                        })
                })

                //decline invite event handler
                socket.on("decline_invite", (data) => {
                        helperFunctions.removeInviteAndUpdate(data.inviter, socket.username);
                })

                //room joined event hander
                socket.on("room_joined", (data) => {
                        connection.query("SELECT * FROM rooms WHERE room_id = ?", [data.room_id], (error, room_results) => {
                                if (error) {
                                        console.log("Error selecting from rooms table: "+error);
                                        return;
                                }
                                if (room_results.length === 0) {
                                        socket.emit("room_not_found");
                                        return;
                                }
                
                                const { player1_username: player1, player2_username: player2, player1_socket_id, player2_socket_id, full } = room_results[0];

                                connection.query("SELECT * FROM invites WHERE room_id = ?", [data.room_id], (error, invite_results) => {
                                        if (error) {
                                                console.log("Error selecting from invites table: "+error);
                                        }
                    
                                        if (invite_results.length > 0) {
                                                const { invited, inviter } = invite_results[0];

                                                if (player1 && socket.username === invited || player2 && socket.username === inviter) {
                                                        socket.emit("user_already_present");
                                                } 
                                                else if (!player1 && socket.username === inviter) {
                                                        socket.emit("invite_not_accepted_yet");
                                                } 
                                                else if (socket.username === inviter) {
                                                        helperFunctions.insertSecondPlayerIntoRooms(socket.username, socket.id, player1_socket_id, data.room_id);
                                                        helperFunctions.removeInviteAndUpdate(inviter, invited);
                                                } 
                                                else if (socket.username === invited) {
                                                        helperFunctions.insertFirstPlayerIntoRooms(socket.username, socket.id, data.room_id);
                                                        socket.emit("room_joined_through_invitation", {opponent: inviter});
                                                } 
                                                else {
                                                        socket.emit("not_invited");
                                                }
                                        } 
                                        else {
                                                if (full){
                                                        socket.emit("room_full");
                                                } 
                                                else if (player1 && socket.username === player1){
                                                        socket.emit("user_already_present")
                                                } 
                                                else if (player1) {
                                                        helperFunctions.insertSecondPlayerIntoRooms(socket.username, socket.id, player1_socket_id, data.room_id);
                                                } 
                                                else {
                                                        helperFunctions.insertFirstPlayerIntoRooms(socket.username, socket.id, data.room_id);
                                                }
                                        }
                                })
                        })
                })

                //find opponent event handler
                socket.on("find_opponent", () => {
                        helperFunctions.findRoom(socket.id, (room) => {
                                if (!room){
                                        return;
                                }
                                const {player1_socket_id, player1_username, player2_username} = room;
                                if (socket.id === player1_socket_id) {
                                        io.to(socket.id).emit("find_opponent", {opponent: player2_username});
                                }
                                else {
                                        io.to(socket.id).emit("find_opponent", {opponent: player1_username});
                                }
                        })
                })

                //room left event handler
                socket.on("room_left", () => {
                        helperFunctions.handleRoomsOnGameDisconnect(socket.id);
                })

                //find invited event handler
                socket.on("find_invited", () => {
                        helperFunctions.fetchAndEmitInvitedUsers(socket.username);
                })
    
                //find invites event handler
                socket.on("find_invites", () => {
                        helperFunctions.fetchAndEmitUserInvites(socket.username);
                })

                //find requests event handler
                socket.on("find_requests", () => {
                        helperFunctions.fetchAndEmitUserFriendRequests(socket.username);
                })

                //send request event handler
                socket.on("send_request", (data) => {
                        connection.query("INSERT INTO friend_requests (sender, receiver) VALUES (?,?)", [data.sender, data.receiver], (error, results) => {
                                if (error) {
                                        console.log("Error inserting into friend_requests table: "+error);
                                        return;
                                }
                                helperFunctions.fetchAndEmitUserSearch(socket.username, data.current_search, socket);
                                helperFunctions.fetchAndEmitUserFriendRequests(data.receiver);
                        })
                })

                //accept request event handler
                socket.on("accept_request", (data) => {
                    
                        helperFunctions.removeFriendRequest(data.requester, socket.username);
                    
                        helperFunctions.insertFriendPairing(socket.username, data.requester);
                    
                        helperFunctions.insertFriendPairing(data.requester, socket.username);
                    
                        helperFunctions.updateUserSearch(data.requester);
                    
                        helperFunctions.updateUserSearch(socket.username);
                    
                        helperFunctions.fetchAndEmitUserFriendRequests(socket.username);   
                    
                        helperFunctions.fetchAndEmitUserStatuses(socket.username);
                    
                        helperFunctions.fetchAndEmitUserStatuses(data.requester);
                    
                })

                //reject request event handler
                socket.on("reject_request", (data) => {
                        helperFunctions.removeFriendRequest(data.requester, socket.username);
                        helperFunctions.updateUserSearch(data.requester);
                        helperFunctions.fetchAndEmitUserFriendRequests(socket.username);
                })

                //search event handler
                socket.on("search", (data) => {
                        helperFunctions.fetchAndEmitUserSearch(socket.username, data.search, socket);
                });
    
                //token verification event handler
                socket.on("verify_token", (data) => {
                        jwt.verify(data.token, process.env.TOKEN_SECRET, (err, decoded) => {
                                if (err) {
                                        socket.emit("verification_status", {success: false, username: null});
                                }
                                else {
                                        if (decoded.username){
                                                socket.username = decoded.username;
                                                socket.emit("verification_status", {success: true, username: decoded.username});
                                                helperFunctions.updateUserOnlineStatus(socket.username, true, () => {return});
                                                connection.query("SELECT * FROM socket_connections WHERE socket_id = ?", [socket.id], (error, results) => {
                                                        if (error) {
                                                                console.log("Error selecting from socket_connections table: "+error)
                                                                return;
                                                        }
                                                        if (results.length === 0) {
                                                                helperFunctions.insertSocketMapping(socket.username, socket.id);
                                                        }
                                                })
                                        }
                                        else {
                                                socket.emit("verification_status", {success: false, username: null});
                                        }
                                }
                        })
                })
    
                //logout event handler
                socket.on("logout", () => {
                        helperFunctions.findUserSocketIds(socket.username, (socketIds) => {
                                socketIds.forEach(socketId => {
                                        io.to(socketId).emit("logout");
                                })
                                connection.query("DELETE FROM socket_connections WHERE username = ?", [socket.username], (error, results) => {
                                        if (error) {
                                                console.log("Error deleting from socket_connections table: "+error);
                                                return;
                                        }
                                        helperFunctions.updateUserOnlineStatus(socket.username, false);
                                        helperFunctions.updateUserStatusesToFriends(socket.username);
                                        helperFunctions.removeAllUserInvitesAndUpdate(socket.username);
                                        helperFunctions.handleRoomsOnSystemDisconnect(socket.username);
                                })
                        })
                })
    
                //disconnect event handler
                socket.on("disconnect", () => {
                        connection.query("DELETE FROM socket_connections WHERE socket_id = ?", [socket.id], (error, results) => {
                                if (error) {
                                        console.log("Error deleting from socket_connections table: "+error)
                                        return;
                                }
                                helperFunctions.handleRoomsOnGameDisconnect(socket.id);
                                helperFunctions.findUserSocketIds(socket.username, (socketIds) => {
                                        if (socketIds.length === 0) {
                                                helperFunctions.updateUserOnlineStatus(socket.username, false, () => {
                                                        helperFunctions.updateUserStatusesToFriends(socket.username);
                                                        helperFunctions.removeAllUserInvitesAndUpdate(socket.username);
                                                });
                                        }
                                })
                        })
                })
        })
};
