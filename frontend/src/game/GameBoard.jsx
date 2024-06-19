import React from "react";
import useAuth from "../hooks/useAuth";
import useOpponent from "../hooks/useOpponent";
import useDisconnection from "../hooks/useDisconnection";
import DisconnectMessage from "./DisconnectMessage";

const GameBoard = ({ socket }) => {
    const username = useAuth(socket);
    const opponent = useOpponent(socket);
    const disconnect = useDisconnection(socket);

    return (
        <div className="game-board">
            {disconnect ? (
                <DisconnectMessage opponent={opponent} socket={socket} />
            ) : (
                <p>Game Starts Here</p>
            )}
        </div>
    );
};

export default GameBoard;