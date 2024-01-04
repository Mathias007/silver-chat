import axios from "axios";
import { createContext, useEffect, useState } from "react"

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() => {
        axios.get('/profile').then(response => {
            console.log(response.data);
        });
    },[])

    return (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    );
}