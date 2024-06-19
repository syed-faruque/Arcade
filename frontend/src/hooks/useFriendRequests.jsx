import { useState, useEffect } from "react";

const useFriendRequests = (username, socket) => {
    const [requesters, setRequesters] = useState([]);

    useEffect(() => {
        if (!socket || !username) return;
        
        socket.emit("find_requests");
        socket.on("find_requests", (data) => {
            setRequesters(data.requesters);
        })

        return () => {
            socket.off("find_requests");
        };
    }, [socket, username]);

    return requesters;
}

export default useFriendRequests;
