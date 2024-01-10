import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
    const [error, setError] = useState(null); // Dodana zmienna do przechowywania błędu

    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

    async function handleSubmit(e) {
        e.preventDefault();

        const url = isLoginOrRegister === "register" ? "register" : "login";

        try {
            const { data } = await axios.post(url, { username, password });
            setLoggedInUsername(username);
            setId(data.id);
            setError("");
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                setError(error.response.data.error);
            } else {
                setError("Wystąpił nieznany błąd.");
            }
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input
                    value={username}
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="block w-full rounded-sm p-2 mb-2"
                />
                <input
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="block w-full rounded-sm p-2 mb-2"
                />
                <button className="bg-blue-500 text-white block w-full rounded-md-sm p-2">
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </button>
                <div className="text-center mt-2">
                    {error && <div className="text-red-500">{error}</div>}
                    {isLoginOrRegister === "register" && (
                        <div>
                            Already a member?{" "}
                            <button
                                onClick={() => setIsLoginOrRegister("login")}
                            >
                                Login here
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === "login" && (
                        <div>
                            Do not have an account?{" "}
                            <button
                                onClick={() => setIsLoginOrRegister("register")}
                            >
                                Register here
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
