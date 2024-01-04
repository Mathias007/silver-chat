import Avatar from "./Avatar"

export default function Contact({id, username, onClick, selected, online }) {
    return (
        <div onClick={() => onClick(id)} key={id} 
            className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (selected ? "bg-blue-200" : "")}>
                {selected && (
                    <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                )}
            <div className="flex gap-2 py-2 pl-4 items-center">
                <Avatar username={username} userId={id} online={online} />
                <span className="text-gray-800">{username}</span>
            </div>
        </div>
    )
}