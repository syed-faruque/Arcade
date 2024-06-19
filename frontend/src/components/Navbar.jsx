import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = ({ socket }) => {
    const [search, setSearch] = useState("");
    const username = useAuth(socket);
    const navigate = useNavigate();

    // Sends logout notice to server
    const handleLogout = () => {
        if (username) {
            socket.emit("logout");
        }
    };

    // Handles change in search input
    const handleChange = (e) => {
        setSearch(e.target.value);
    };

    // Redirects to search page upon pressing enter
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            navigate(`/search/${e.target.value}`);
        }
    };

    // Renders the navigation bar
    return (
        <div className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h1 className="text-white text-lg font-semibold">Gameroom</h1>
                    <input
                        className="px-4 py-2 rounded-lg border-2 border-gray-600 focus:outline-none focus:border-blue-500 w-64"
                        placeholder="Search Users"
                        value={search}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        type="text"
                    />
                </div>
                <div className="flex items-center space-x-8">
                    <NavLink to="/home" className="text-white hover:text-blue-500">Home</NavLink>
                    <NavLink to="/lobby" className="text-white hover:text-blue-500">Create Lobby</NavLink>
                    <NavLink to="/invitations" className="text-white hover:text-blue-500">Invitations</NavLink>
                    <NavLink to="/requests" className="text-white hover:text-blue-500">Friend Requests</NavLink>
                    <button
                        className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
