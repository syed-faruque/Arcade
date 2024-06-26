/**
 * author: Syed Faruque
 * created: June 8 2024
**/

import { useState, useEffect } from "react";

const useSearchResults = (username, search, socket) => {
  const [friends, setFriends] = useState([]);
  const [nonfriends, setNonfriends] = useState([]);
  const [requested, setRequested] = useState([]);

  useEffect(() => {
    if (!socket || !search || !username) return;

    socket.emit("search", { search: search });
    socket.on("update_search", () => {
      socket.emit("search", { search: search });
    });

    socket.on("search", (data) => {
      setFriends(data.friends.filter(user => user !== username));
      setNonfriends(data.nonfriends.filter(user => user !== username));
      setRequested(data.requested.filter(user => user !== username));
    });

    return () => {
      socket.off("update_search");
      socket.off("search");
    };
  }, [socket, search, username]);
<<<<<<< HEAD

  return { friends, nonfriends, requested };
};
=======
>>>>>>> d6cc1e333d1a26ae0591384fbd41a72d976c93b3

  return { friends, nonfriends, requested };
};

export default useSearchResults;
