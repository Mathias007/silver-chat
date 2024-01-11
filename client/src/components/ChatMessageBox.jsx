import axios from "axios";

import FileIcon from "../assets/File.svg";

export default function ChatMessageBox({ messages, userId, inputRef }) {
    return (
        <div className="relative h-full">
            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={
                            message.sender === userId
                                ? "text-right"
                                : "text-left"
                        }
                    >
                        <div
                            className={
                                "text-left inline-block p-2 my-2 rounded-md text-sm " +
                                (message.sender === userId
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-500")
                            }
                        >
                            {message.text}
                            {message.file && (
                                <div className="">
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 border-b"
                                        href={`${axios.defaults.baseURL}/uploads/${message.file}`}
                                    >
                                        <img
                                            src={FileIcon}
                                            alt="File Icon"
                                            className="w-4 h-4"
                                        />
                                        {message.file}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={inputRef}></div>
            </div>
        </div>
    );
}
