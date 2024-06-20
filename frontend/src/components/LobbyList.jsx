/**
 * @author Syed Faruque
 * created: May 25 2024
**/

import React from "react";

const LobbyList = ({ users, invitedUsers, handleInvite, title }) => {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="user-list">
        {users.map((user, index) => {
          const isInvited = invitedUsers.includes(user.username);
          return (
            <div key={index} className="user-item flex items-center justify-between mb-2">
              <div className="user-info">
                <span>{user.username}</span>
              </div>
              {isInvited ? (
                <button disabled className="px-4 py-2 rounded-md bg-gray-400 text-white">Invite Sent</button>
              ) : (
                <button
                  onClick={() => handleInvite(user)}
                  className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                >
                  Invite
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LobbyList;
