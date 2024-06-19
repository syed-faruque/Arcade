import React from "react";
import { useNavigate } from "react-router-dom";

const DisconnectMessage = ({ opponent, socket }) => {
    const navigate = useNavigate();

    const handleLeaveRoom = async () => {
        await socket.emit("room_left");
        navigate("/home");
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
            <p className="text-gray-700 text-center">
                Victory!! {opponent} disconnected
            </p>
            <button 
                onClick={handleLeaveRoom} 
                className="fixed bottom-4 left-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
                Leave Room
            </button>
        </div>
    );
};

export default DisconnectMessage;