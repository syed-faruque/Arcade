/**
 * author: Syed Faruque
 * created: June 8 2024
**/

import React from "react";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import useSearchResults from "../hooks/useSearchResults";
import { useParams } from "react-router-dom";
import '../prettify/Styles.css';

const Search = ({ socket }) => {
  const username = useAuth(socket);
  const { search } = useParams();
  const { friends, nonfriends, requested } = useSearchResults(username, search, socket);

  const sendFriendRequest = (recipient) => {
    socket.emit("send_request", { sender: username, receiver: recipient, current_search: search });
  };

  const renderButton = (recipient) => {
    if (requested.includes(recipient)) {
      return (
        <button className="bg-gray-300 text-gray-700 cursor-not-allowed px-3 py-1 rounded-md">
          Request Sent
        </button>
      );
    } else {
      return (
        <button 
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          onClick={() => sendFriendRequest(recipient)}
        >
          Send Friend Request
        </button>
      );
    }
  };

  const results = (title, results, isFriend) => (
    <>
      <h3 className="text-xl font-semibold my-4">{title}</h3>
      {results.map((result, index) => (
        <div key={index} className="flex justify-between items-center py-2">
          <span className="mr-2">{result}</span>
          {!isFriend && renderButton(result)}
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar socket={socket} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-semibold mb-4 text-center">Search Results</h2>
          <div className="search-results">
            {friends.length > 0 || nonfriends.length > 0 ? (
              <>
                {friends.length > 0 && results("Friends", friends, true)}
                {nonfriends.length > 0 && results("Non-Friends", nonfriends, false)}
              </>
            ) : (
              <p className="text-gray-600 text-center">No results found for "{search}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;