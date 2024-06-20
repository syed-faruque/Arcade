/**
 * author: Syed Faruque
 * created: May 20 2024
**/

import { Link } from "react-router-dom";
import '../prettify/Styles.css';

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Gameroom</h1>
        <label className="block text-xl font-semibold text-black mb-4">
          You have successfully signed up. Click below to login with your new account
        </label>
        <Link
          to="/"
          className="inline-block w-full mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition duration-200"
        >
          Login with account
        </Link>
      </div>
    </div>
  );
};

export default Success;
