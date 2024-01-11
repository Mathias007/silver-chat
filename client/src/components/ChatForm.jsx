import FileIcon from "../assets/File.svg";
import SendIcon from "../assets/Send.svg";

export default function ChatForm({
    newMessageText,
    setNewMessageText,
    sendMessage,
    sendFile,
}) {
    return (
        <form className="flex gap-2" onSubmit={sendMessage}>
            <input
                type="text"
                value={newMessageText}
                onChange={(ev) => setNewMessageText(ev.target.value)}
                placeholder="Type your message here"
                className="bg-white flex-grow border rounded-sm p-2"
            />
            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
                <input type="file" className="hidden" onChange={sendFile} />
                <img src={FileIcon} alt="Attachment Icon" className="w-6 h-6" />
            </label>
            <button
                type="submit"
                className="bg-blue-500 p-2 text-white rounded-sm"
            >
                <img src={SendIcon} alt="Send Icon" className="w-6 h-6" />
            </button>
        </form>
    );
}
