/**
 * author: Syed Faruque
 * created: May 25 2024
**/

import { useState, useEffect } from "react";

const useFriendStatuses = (username, socket) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("find_statuses");
    socket.on("find_statuses", (data) => {
      setOnlineUsers(data.online.filter(user => user.username !== username));
      setOfflineUsers(data.offline.filter(user => user.username !== username));
    });

    socket.emit("find_invited");
    socket.on("find_invited", (data) => {
      setInvitedUsers(data.invited);
    });

    return () => {
      socket.off("find_statuses");
      socket.off("find_invited");
    };
  }, [socket, username]);

  return { onlineUsers, offlineUsers, invitedUsers };
};

export default useFriendStatuses;