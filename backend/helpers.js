/**
 * @author Syed Faruque
 * created: May 20 2024
**/

//~~~~~~~~~~~~~~~ separate functions for repeated usage in socketHandlers.js ~~~~~~~~~~~~~~~//

// database import
const connection = require('./database');

// helper functions
const helpers = (io) => {
    return {
        // finds the list of socket ids for a specific user
        findUserSocketIds: function(username, callback) {
            connection.query("SELECT * FROM socket_connections WHERE username = ?", [username], (error, results) => {
                if (error) {
                    console.log("Error selecting from socket_connections table: " + error);
                    return;
                }
                const socketIds = results.map(row => row.socket_id);
                callback(socketIds);
            });
        },

        // sends back an object containing the list of online friends and the list of offline friends to all socket connections of a specific user
        fetchAndEmitUserStatuses: function(username) {
            const query = `
                SELECT 
                    a.username, a.online_status 
                FROM 
                    accounts a JOIN friends f 
                ON 
                    a.username = f.friend 
                WHERE 
                    f.user = ?
            `;
            
            connection.query(query, [username], (error, results) => {
                if (error) {
                    console.log("Error selecting from accounts table: " + error);
                    return;
                }

                const friends = results.map(row => ({ username: row.username, online_status: row.online_status }));
                const onlineFriends = friends.filter(friend => friend.online_status);
                const offlineFriends = friends.filter(friend => !friend.online_status);

                this.findUserSocketIds(username, (socketIds) => {
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit("find_statuses", {online: onlineFriends, offline: offlineFriends});
                    });
                });
            });
        },

        // does the fetchAndEmitUserStatuses functionality for every friend of a specific user
        updateUserStatusesToFriends: function(username) {
            connection.query("SELECT * FROM friends WHERE user = ?", [username], (error, results) => {
                if (error) {
                    console.log("Error selecting from friends table: "+error);
                    return;
                }

                const friends = results.map(row => (row.friend));
                friends.forEach(friend => {
                    this.fetchAndEmitUserStatuses(friend);
                });
            });
        },

        // finds the list of people a specific user invited
        findInvitedUsers: function(username, callback) {
            connection.query("SELECT * FROM invites WHERE inviter = ?", [username], (error, results) => {
                if (error) {
                    console.log("Error selecting from invites table: "+error);
                    return;
                }
                const invited = results.map(row => (row.invited));
                callback(invited);
            });
        },

        // sends back the list of invited users to all socket connections of a specific user
        fetchAndEmitInvitedUsers: function(username) {
            this.findInvitedUsers(username, (invited) => {
                this.findUserSocketIds(username, socketIds => {
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit("find_invited", {invited: invited});
                    });
                });
            });
        },

        // changes a specific user's online status
        updateUserOnlineStatus: function(username, status, callback) {
            connection.query("UPDATE accounts SET online_status = ? WHERE username = ?", [status, username], (error, results) => {
                if (error) {
                    console.log("Error updating accounts: "+error);
                    return;
                }
                callback();
            });
        },

        // inserts a socket pairing into the database
        insertSocketMapping: function(username, socket_id){
            connection.query("INSERT INTO socket_connections (username, socket_id) values (?,?)", [username, socket_id], (error, results) => {
                if (error) {
                    console.log("Error updating socket_connections table: "+error);
                    return;
                }
            });
        },

        // inserts a friend pairing into the database
        insertFriendPairing: function(user, friend){
            connection.query("INSERT INTO friends (user, friend) VALUES (?,?)", [user, friend], (error, results) => {
                if (error) {
                    console.log("Error inserting into friends table "+error);
                    return;
                }
            });
        },

        // sends back list of invites to all socket connections of a specific user
        fetchAndEmitUserInvites: function(username) {
            connection.query("SELECT * FROM invites WHERE invited = ?", [username], (error, results) => {
                if (error) {
                    console.log("Error selecting from invites table: " + error);
                    return;
                }
                const invites = results.map(row => ({ inviter: row.inviter, room_id: row.room_id }));
                this.findUserSocketIds(username, (socketIds) => {
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit("find_invites", { invites: invites });
                    });
                });
            });
        },

        // finds the list of friend requests to a specific user
        findFriendRequests: function(username, callback) {
            connection.query("SELECT * FROM friend_requests WHERE receiver = ?", [username], (error, results) => {
                if (error) {
                    console.log("Error selecting from friend_requests table: "+error);
                    return;
                }
                const requesters = results.map(row => (row.sender));
                callback(requesters);
            });
        },

        // sends back list of friend requests to all socket connections of a specific user
        fetchAndEmitUserFriendRequests: function(username){
            this.findFriendRequests(username, (requesters) => {
                this.findUserSocketIds(username, (socketIds) => {
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit("find_requests", {requesters: requesters});
                    });
                });
            });
        },

        //inserts first player into rooms table
        insertFirstPlayerIntoRooms: function(username, socket_id, room_id) {
            connection.query("UPDATE rooms SET player1_username = ?, player1_socket_id = ?, full = ? WHERE room_id = ?", [username, socket_id, false, room_id], (error, results) => {
                if (error) {
                    console.log("Error inserting into rooms table: "+error);
                    return;
                }
            });
        },

        //inserts second player into rooms table
        insertSecondPlayerIntoRooms: function(username, player2_socket_id, player1_socket_id, room_id) {
            connection.query("UPDATE rooms SET player2_username = ?, player2_socket_id = ?, full = ? WHERE room_id = ?", [username, player2_socket_id, true, room_id], (error, results) => {
                if (error) {
                    console.log("Error inserting into rooms table: "+error);
                    return;
                }
                io.to(player1_socket_id).emit("game_started");
                io.to(player2_socket_id).emit("game_started");
            });
        },

        // searches the database for friends and non-friends that match a specific user's search query. Sends this and the list of people the user friend requested back to the frontend.
        fetchAndEmitUserSearch: function(username, search, socket) {
            const friends = [];
            const nonfriends = [];
            let requested = [];
            const query = `
                SELECT 
                    a.username,
                    CASE 
                        WHEN f.user IS NOT NULL THEN 'friend' 
                        ELSE 'nonfriend'
                    END AS status
                FROM 
                    accounts a
                LEFT JOIN 
                    friends f
                ON 
                    a.username = f.friend AND f.user = ?
                WHERE 
                    a.username LIKE ? AND a.username != ?
            `;
            connection.query(query, [username, `${search}%`, username], (error, results) => {
                if (error) {
                    console.log("Error selecting from accounts table: " + error);
                    return;
                }

                results.forEach(row => {
                    if (row.status === 'friend') {
                        friends.push(row.username);
                    } else {
                        nonfriends.push(row.username);
                    }
                });

                connection.query("SELECT * FROM friend_requests WHERE sender = ?", [username], (error, results) => {
                    if (error) {
                        console.log("Error selecting from friend_requests table: " + error);
                        return;
                    }
                    requested = results.map(row => row.receiver);
                    socket.emit("search", {friends: friends, nonfriends: nonfriends, requested: requested});
                });
            });
        },

        // allows for a user's search update
        updateUserSearch: function(username) {
            this.findUserSocketIds(username, (socketIds) => {
                socketIds.forEach(socketId => {
                    io.to(socketId).emit("update_search");
                });
            });
        },

        // removes a friend request
        removeFriendRequest: function(sender, receiver) {
            connection.query("DELETE FROM friend_requests WHERE sender = ? AND receiver = ?", [sender, receiver], (error, results) => {
                if (error) {
                    console.log("Error deleting from friend_requests table: "+error);
                    return;
                }
            });
        },

        //removes an invite and updates invites for inviter and invited
        removeInviteAndUpdate: function(inviter, invited) {
            connection.query("DELETE FROM invites WHERE inviter = ? AND invited = ?", [inviter, invited], (error, results) => {
                if (error){
                    console.log("Error deleting from invites table: "+error);
                    return;
                }
                this.fetchAndEmitInvitedUsers(inviter);
                this.fetchAndEmitUserInvites(invited);
            });
        },

        //removes all user invites and updates invites to all invited users
        removeAllUserInvitesAndUpdate: function(inviter) {
            this.findInvitedUsers(inviter, (invited_users) => {
                connection.query("DELETE from invites WHERE inviter = ?", [inviter], (error, results) => {
                    if (error) {
                        console.log("Error deleting from invites table: "+error);
                        return;
                    }
                    invited_users.forEach(invited_user => {
                        this.fetchAndEmitUserInvites(invited_user);
                    });
                });
            });
        },

        //removes a singular room
        destroyRoom: function(room_id){
            connection.query("DELETE FROM rooms WHERE room_id = ?", [room_id], (error, results) => {
                if (error) {
                    console.log("Error deleting from rooms: "+error);
                    return;
                }
            });
        },
        
        //find room that a player is in
        findRoom: function(player_socket_id, callback) {
            connection.query("SELECT * FROM rooms WHERE player1_socket_id = ? OR player2_socket_id = ?", [player_socket_id, player_socket_id], (error, results) => {
                if (error) {
                    console.log("Error selecting from rooms: "+error);
                    return;
                }
                callback(results[0]);
            });
        },

        //remove singular room and updates the player still present
        handleRoomsOnGameDisconnect: function(player_socket_id) {
            this.findRoom(player_socket_id, (room) => {
                if (!room) {
                    return;
                }
                const {player1_socket_id, player2_socket_id, full, room_id} = room;
                if (!full){
                    return;
                }
                else if (player_socket_id === player1_socket_id){
                    io.to(player2_socket_id).emit("disconnection");
                }
                else {
                    io.to(player1_socket_id).emit("disconnection");
                }
                this.destroyRoom(room_id);
            });
        },

        //removes all rooms that a player is a part of and informs the other players in those rooms
        handleRoomsOnSystemDisconnect: function(player) {
            connection.query("SELECT * FROM rooms WHERE player1_username = ? OR player2_username = ?", [player, player], (error, results) => {
                if (error) {
                    console.log("Error selecting from rooms table: "+error);
                    return;
                }
                results.forEach(room => {
                    if (!room.full){
                        return;
                    }
                    else if (player === room.player1_username) {
                        io.to(room.player2_socket_id).emit("disconnection");
                    }
                    else {
                        io.to(room.player1_socket_id).emit("disconnection");
                    }
                    this.destroyRoom(room.room_id);
                });
            });
        }
    };
};

// Export the helper object
module.exports = helpers;
