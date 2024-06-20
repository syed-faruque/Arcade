/**
 * author: Syed Faruque
 * created: May 24 2024
**/

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Success from "../pages/Success";
import Home from "../pages/Home";
import Lobby from "../pages/Lobby";
import Requests from "../pages/Requests";
import Search from "../pages/Search";
import Room from "../pages/Room";
import Invitations from "../pages/Invitations";

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const new_socket = io("http://localhost:3001");
    setSocket(new_socket);
    return () => {
      new_socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login socket={socket} />} />
        <Route path="/signup" element={<Signup socket={socket} />} />
        <Route path="/success" element={<Success socket={socket} />} />
        <Route path="/home" element={<Home socket={socket} />} />
        <Route path="/lobby" element={<Lobby socket={socket} />} />
        <Route path="/invitations" element={<Invitations socket={socket} />} />
        <Route path="/search/:search" element={<Search socket={socket} />} />
        <Route path="/:room_id" element={<Room socket={socket} />} />
        <Route path="/requests" element={<Requests socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
