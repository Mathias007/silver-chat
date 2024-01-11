import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import RegisterAndLoginForm from "../components/RegisterAndLoginForm";
import Chat from "../components/Chat";

export default function Routes() {
    const { username, id } = useContext(UserContext);

    if (username) {
        return <Chat />;
    }

    return <RegisterAndLoginForm />;
}
