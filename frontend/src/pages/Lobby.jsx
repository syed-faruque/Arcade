import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useFriendStatuses from "../hooks/useFriendStatuses";
import Navbar from "../components/Navbar";
import LobbyList from "../components/LobbyList";
import '../prettify/Styles.css';

const Lobby = ({ socket }) => {
    const username = useAuth(socket);
    const {onlineUsers, offlineUsers, invitedUsers} = useFriendStatuses(username, socket);

    const handleInvite = (user) => {
        socket.emit("send_invite", { user: user.username });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar socket={socket} />
            <div className="container mx-auto px-4 py-8">
                {(onlineUsers.length > 0 || offlineUsers.length > 0) ? (
                    <>
                        {onlineUsers.length > 0 ? (
                            <LobbyList
                                users={onlineUsers}
                                invitedUsers={invitedUsers}
                                handleInvite={handleInvite}
                                title="Online Friends"
                            />
                        ): (
                            <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h2 className="text-3xl font-semibold mb-4">Online Friends</h2>
                                <p className="text-gray-700 text-center">No Friends Online</p>
                            </div>
                        )}
                        {offlineUsers.length > 0 && (
                            <LobbyList
                                users={offlineUsers}
                                invitedUsers={invitedUsers}
                                handleInvite={handleInvite}
                                title="Offline Friends"
                            />
                        )}
                    </>
                ) : (
                    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-3xl font-semibold mb-4 text-center">No Friends Available</h2>
                        <p className="text-gray-700 text-center">To add friends, search their username, and then you can send them friend requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lobby;
