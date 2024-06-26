/**
 * author: Syed Faruque
 * created: June 2 2024
**/

import { useState, useEffect } from "react";

const useInvitations = (username, socket) => {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    if (!socket || !username) return;
    
    socket.emit("find_invites");
    socket.on("find_invites", (data) => {
      setInvites(data.invites);
    });

    return () => {
      socket.off("find_invites");
    };
  }, [socket, username]);

  return invites;
};

<<<<<<< HEAD
export default useInvitations;
=======
export default useInvitations;
>>>>>>> d6cc1e333d1a26ae0591384fbd41a72d976c93b3
