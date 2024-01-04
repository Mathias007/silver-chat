import axios from "axios";
import { useContext, useState } from "react"
import { UserContext } from "./UserContext";

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const { setUsername:setLoggedInUsername, setId } = useContext(UserContext)

    async function register(e) {
        e.preventDefault();
        const { data } = await axios.post('/register', { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={register}>
                <input 
                    value={username} 
                    type="text" 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="username" 
                    className="block w-full rounded-sm p-2 mb-2" 
                />
                <input 
                    value={password} 
                    type="password" 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="password" 
                    className="block w-full rounded-sm p-2 mb-2" 
                />
                <button 
                    className="bg-blue-500 text-white block w-full rounded-md-sm p-2">
                        Register
                </button>
            </form>
        </div>
    )
}