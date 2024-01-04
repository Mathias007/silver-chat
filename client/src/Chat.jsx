import { useEffect, useState, useContext, useRef } from "react";
import Logo from "./Logo";
import { UserContext } from "./UserContext";

import { uniqBy } from 'lodash';
import axios from "axios";
import Contact from "./Contact";

export default function Chat() {
    const [ws, setWs] = useState(null);

    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);

    const {username, id, setId, setUsername } = useContext(UserContext);

    const divUnderMessages = useRef();

    useEffect(() => {
        connectToWs();
      }, [selectedUserId]);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
          setTimeout(() => {
            console.log('Disconnected. Trying to reconnect.');
            connectToWs();
          }, 1000);
        });
    }

    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });

        setOnlinePeople(people);
    }

    function handleMessage(e) {
        const messageData = JSON.parse(e.data);
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        } else if ('text' in messageData) {
            setMessages(prev => ([...prev, {...messageData}]))
        }
    }

    function logout() {
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        });
    }

    function sendMessage(e) {
        e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));
        setNewMessageText('');
        setMessages(prev => ([...prev, {
            text: newMessageText, 
            sender: id,
            recipient: selectedUserId,
            _id: Date.now()
        }]));
    }

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({behavior: 'smooth', block: 'end'});
        }
    }, [messages]);

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArray = res.data
                .filter(person => person._id !== id)
                .filter(person => !Object.keys(onlinePeople).includes(person._id));
                
            const offlinePeople = {};

            offlinePeopleArray.forEach(person => {
                offlinePeople[person._id] = person;
            });

            setOfflinePeople(offlinePeople);
        });
    }, [onlinePeople])

    useEffect(() => {
        if (selectedUserId) {
          axios.get('/messages/'+selectedUserId).then(res => {
            setMessages(res.data);
          });
        }
    }, [selectedUserId]);
    
    const onlinePeopleExcludingOurUser = {...onlinePeople};
        delete onlinePeopleExcludingOurUser[id];

    const messagesWithoutDuplicates = uniqBy(messages, '_id');

    return (
        <div className="flex h-screen">
            <div className="bg-white-100 w-1/3 flex-col">
                <div className="flex-grow">
                    <Logo />
                    {Object.keys(onlinePeopleExcludingOurUser).map(userId => (
                        <Contact 
                            key={userId}
                            id={userId} 
                            username={onlinePeopleExcludingOurUser[userId]}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            online={true}
                        />
                    ))}
                    {Object.keys(offlinePeople).map(userId => (
                        <Contact 
                            key={userId}
                            id={userId} 
                            username={offlinePeople[userId].username}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            online={false}
                        />
                    ))}
                    <div className="p-2 text-center flex items-center justify-center">
                        <span className="mr-2 text-sm text-gray-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>
                            {username}
                        </span>
                        <button 
                            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm"
                            onClick={logout}
                            >Logout</button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-gray-400">&larr; Select a person from the sidebar</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messagesWithoutDuplicates.map(message => (
                                    <div key={message._id} className={(message.sender === id ? "text-right" : "text-left")}>
                                        <div className={"text-left inline-block p-2  my-2 rounded-md text-sm " + (message.sender === id ? "bg-blue-500 text-white" : "bg-white text-gray-500")}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input 
                            type="text" 
                            value={newMessageText}
                            onChange={e => setNewMessageText(e.target.value)}
                            placeholder="Type your message here" 
                            className="bg-white flex-grow border rounded-sm p-2" 
                        />
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}