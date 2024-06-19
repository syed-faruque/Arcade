/**
 * @author Syed Faruque
 * created: June 18 2024
**/

import { useEffect, useState } from "react";

const useDisconnection = (socket) => {
    const [disconnect, setDisconnect] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on("disconnection", () => {
            setDisconnect(true);
        });

        return () => {
            socket.off("disconnection");
        };
    }, [socket]);

    return disconnect;
};

export default useDisconnection;
