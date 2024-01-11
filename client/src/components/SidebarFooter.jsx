import UserIcon from "../assets/User.svg";

export default function SidebarFooter({ username, logout }) {
    return (
        <div className="p-2 text-center flex items-center justify-center">
            <span className="mr-2 text-sm text-gray-600 flex items-center">
                <img src={UserIcon} alt="User Icon" className="w-4 h-4" />
                {username}
            </span>
            <button
                onClick={logout}
                className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm"
            >
                Logout
            </button>
        </div>
    );
}
