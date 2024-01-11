import ChatIcon from "../assets/Chat.svg";

export default function Logo() {
    return (
        <div className="text-blue-600 font-bold flex gap-2 p-4">
            <img src={ChatIcon} alt="Chat Icon" className="w-6 h-6" />
            Silver Chat
        </div>
    );
}
