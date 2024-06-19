/**
 * @author Syed Faruque
 * created: June 18 2024
**/

import { useEffect, useState } from "react";

const useOpponent = (socket) => {
    const [opponent, setOpponent] = useState("");

    useEffect(() => {
        if (!socket) return;

        socket.emit("find_opponent");
        socket.on("find_opponent", (data) => {
            setOpponent(data.opponent);
        });

        return () => {
            socket.off("find_opponent");
        };
    }, [socket]);

    return opponent;
};

export default useOpponent;
