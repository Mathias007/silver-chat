import Logo from "./Logo";
import Contact from "./Contact";

export default function SidebarContent({
    selectedUserId,
    setSelectedUserId,
    onlinePeople,
    offlinePeople,
}) {
    return (
        <div className="flex-grow">
            <Logo />
            {Object.keys(onlinePeople).map((userId) => (
                <Contact
                    key={userId}
                    id={userId}
                    online={true}
                    username={onlinePeople[userId]}
                    onClick={() => setSelectedUserId(userId)}
                    selected={userId === selectedUserId}
                />
            ))}
            {Object.keys(offlinePeople).map((userId) => (
                <Contact
                    key={userId}
                    id={userId}
                    online={false}
                    username={offlinePeople[userId].username}
                    onClick={() => setSelectedUserId(userId)}
                    selected={userId === selectedUserId}
                />
            ))}
        </div>
    );
}
