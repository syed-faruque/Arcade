/**
 * author: Syed Faruque
 * created: May 20 2024
**/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = (socket) => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const token = localStorage.getItem("token");
    const data = { token: token };
    
    socket.emit("verify_token", data);
    socket.emit("find_statuses");
    socket.on("verification_status", (data) => {
      if (!data.success) {
        navigate("/");
      }
      setUsername(data.username);
    });

    socket.on("logout", () => {
      localStorage.removeItem("token");
      navigate("/");
    });

    return () => {
      socket.off("verification_status");
      socket.off("logout");
    };
  }, [socket, navigate]);

  return username;
};
