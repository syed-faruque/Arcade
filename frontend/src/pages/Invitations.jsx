/**
 * @author Syed Faruque
 * created: June 2 2024
**/

import ListWithActions from "../components/ListWithActions";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useInvitations from "../hooks/useInvitations";

const Invitations = ({ socket }) => {
    const navigate = useNavigate();
    const username = useAuth(socket);
    const invites = useInvitations(username, socket);

    const inviteMessages = invites.map(invite => invite.inviter + " challenges you to a duel");

    const handleAccept = (index) => {
        navigate(`/${invites[index].room_id}`);
    };

    const handleDecline = (index) => {
        socket.emit("decline_invite", invites[index]);
    };

    return (
        <ListWithActions
            title="Invitations"
            items={inviteMessages}
            onAccept={handleAccept}
            onDecline={handleDecline}
            emptyMessage="No invitations found."
            socket={socket}
        />
    );
};

export default Invitations;
