import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { uniqBy } from "lodash";
import axios from "axios";

import SidebarContent from "./SidebarContent.jsx";
import SidebarFooter from "./SidebarFooter.jsx";
import ChatEmptyContent from "./ChatEmptyContent.jsx";
import ChatMessageBox from "./ChatMessageBox.jsx";
import ChatForm from "./ChatForm.jsx";

export default function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState("");
    const [messages, setMessages] = useState([]);

    const { username, id, setId, setUsername } = useContext(UserContext);
    const divUnderMessages = useRef();

    useEffect(() => {
        connectToWs();
    }, [selectedUserId]);

    function connectToWs() {
        const ws = new WebSocket("ws://localhost:4040");
        setWs(ws);
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("close", () => {
            setTimeout(() => {
                console.log("Disconnected. Trying to reconnect.");
                connectToWs();
            }, 1000);
        });
    }

    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        console.log({ ev, messageData });
        if ("online" in messageData) {
            showOnlinePeople(messageData.online);
        } else if ("text" in messageData) {
            if (messageData.sender === selectedUserId) {
                setMessages((prev) => [...prev, { ...messageData }]);
            }
        }
    }

    function logout() {
        axios.post("/logout").then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        });
    }

    function sendMessage(ev, file = null) {
        if (ev) ev.preventDefault();

        ws.send(
            JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
                file,
            })
        );

        if (file) {
            axios.get("/messages/" + selectedUserId).then((res) => {
                setMessages(res.data);
            });
        } else {
            setNewMessageText("");
            setMessages((prev) => [
                ...prev,
                {
                    text: newMessageText,
                    sender: id,
                    recipient: selectedUserId,
                    _id: Date.now(),
                },
            ]);
        }
    }

    function sendFile(ev) {
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,
            });
        };
    }

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    useEffect(() => {
        axios.get("/people").then((res) => {
            const offlinePeopleArr = res.data
                .filter((p) => p._id !== id)
                .filter((p) => !Object.keys(onlinePeople).includes(p._id));
            const offlinePeople = {};
            offlinePeopleArr.forEach((p) => {
                offlinePeople[p._id] = p;
            });
            setOfflinePeople(offlinePeople);
        });
    }, [onlinePeople]);

    useEffect(() => {
        if (selectedUserId) {
            axios.get("/messages/" + selectedUserId).then((res) => {
                setMessages(res.data);
            });
        }
    }, [selectedUserId]);

    const onlinePeopleExclOurUser = { ...onlinePeople };
    delete onlinePeopleExclOurUser[id];

    const messagesWithoutDupes = uniqBy(messages, "_id");

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <SidebarContent
                    selectedUserId={selectedUserId}
                    setSelectedUserId={setSelectedUserId}
                    onlinePeople={onlinePeopleExclOurUser}
                    offlinePeople={offlinePeople}
                />
                <SidebarFooter username={username} logout={logout} />
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && <ChatEmptyContent />}
                    {!!selectedUserId && (
                        <ChatMessageBox
                            messages={messagesWithoutDupes}
                            userId={id}
                            inputRef={divUnderMessages}
                        />
                    )}
                </div>
                {!!selectedUserId && (
                    <ChatForm
                        newMessageText={newMessageText}
                        setNewMessageText={setNewMessageText}
                        sendMessage={sendMessage}
                        sendFile={sendFile}
                    />
                )}
            </div>
        </div>
    );
}
