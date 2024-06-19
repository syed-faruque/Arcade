import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import '../prettify/Styles.css';

const Home = ({ socket }) => {
    const username = useAuth(socket);

    useEffect(() => {
        if (!socket || !username) return;

    }, [socket, username])

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar socket={socket} />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                    <h1 className="text-3xl font-semibold mb-4">Welcome to Gameroom {username}</h1>
                    <p className="text-gray-700 text-center">Using the search feature, you can find new friends, and then create a lobby together! Enjoy!</p>
                </div>
            </div>
        </div>
    )
}

export default Home;
