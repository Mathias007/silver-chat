import SilverPhoenixLogo from "../assets/phoenix-silver.png";

export default function ChatEmptyContent() {
    return (
        <div className="flex flex-col h-full flex-grow items-center justify-center">
            <h3 className="text-2xl text-blue-600 font-bold mb-4">
               Welcome to the Silver Chat App!
            </h3>
            <img
                src={SilverPhoenixLogo}
                alt="silver-phoenix-logo"
                className="w-48 h-48 mb-4"
            />
            <div className="text-gray-600">
                &larr; Select a person from the sidebar
            </div>
        </div>
    );
}
