/**
 * author: Syed Faruque
 * created: June 7 2024
**/

import ListWithActions from "../components/ListWithActions";
import useAuth from "../hooks/useAuth";
import useFriendRequests from "../hooks/useFriendRequests";

const Requests = ({ socket }) => {
  const username = useAuth(socket);
  const requesters = useFriendRequests(username, socket);

  const handleAccept = (index) => {
    const requester = requesters[index];
    socket.emit("accept_request", { requester });
  };

  const handleDecline = (index) => {
    const requester = requesters[index];
    socket.emit("reject_request", { requester });
  };

  const requestMessages = requesters.map(requester => `${requester} wants to be your friend`);

  return (
    <ListWithActions
      title="Friend Requests"
      items={requestMessages}
      onAccept={handleAccept}
      onDecline={handleDecline}
      emptyMessage="No friend requests found."
      socket={socket}
    />
  );
};

export default Requests;