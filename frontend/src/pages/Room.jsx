/**
 * author: Syed Faruque
 * created: June 12 2024
**/

import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import GameBoard from "../game/GameBoard";
import '../prettify/Styles.css';

const Room = ({ socket }) => {
  const username = useAuth(socket);
  const { room_id } = useParams();
  const [opponent, setOpponent] = useState("");
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !username || !room_id) return;

    socket.emit("room_joined", { room_id });

    socket.on("room_joined_through_invitation", (data) => {
      setOpponent(data.opponent);
    });

    socket.on("user_already_present", () => {
      setError("User is already present");
    });

    socket.on("room_not_found", () => {
      setError("Room not found in database");
    });

    socket.on("not_invited", () => {
      setError("You are not invited to this room");
    });

    socket.on("room_full", () => {
      setError("This room is fully occupied");
    });

    socket.on("invite_not_accepted_yet", () => {
      setError("Your friend hasn't accepted the invite yet");
    });

    socket.on("game_started", () => {
      setGameStarted(true);
    });

    return () => {
      socket.off("room_joined_through_invitation");
      socket.off("user_already_present");
      socket.off("room_not_found");
      socket.off("not_invited");
      socket.off("room_full");
      socket.off("invite_not_accepted_yet");
      socket.off("start_game");
      socket.off("disconnection");
    };
  }, [socket, username, room_id]);

  const handleLeaveRoom = async () => {
    await socket.emit("room_left");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8">
        {error ? (
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : gameStarted ? (
          <div>
            <GameBoard socket={socket} />
          </div>
        ) : opponent ? (
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
            <p className="text-gray-700 text-center">Waiting for {opponent}....</p>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
            <p className="text-gray-700 text-center">Waiting for opponent to join....</p>
          </div>
        )}
      </div>
      {!gameStarted && (
        <button
          onClick={handleLeaveRoom}
          className="fixed bottom-4 left-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Leave Room
        </button>
      )}
    </div>
  );
};

export default Room;