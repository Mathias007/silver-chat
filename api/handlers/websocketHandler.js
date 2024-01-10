import jwt from "jsonwebtoken";
import fs from "fs";
import { WebSocketServer } from "ws";
import MessageModel from "../models/Message.js";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeWebSocket(server, jwtSecret) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (connection, req) => {
        handleConnection(connection, req, jwtSecret, wss);
    });
}

function notifyAboutOnlinePeople(wss) {
    [...wss.clients].forEach((client) => {
        client.send(
            JSON.stringify({
                online: [...wss.clients].map((c) => ({
                    userId: c.userId,
                    username: c.username,
                })),
            })
        );
    });
}

function handleConnection(connection, req, jwtSecret, wss) {
    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople(wss);
        }, 1000);
    }, 5000);

    connection.on("pong", () => {
        clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;

    if (cookies) {
        const tokenCookieString = cookies
            .split(";")
            .find((str) => str.startsWith("token="));
        if (tokenCookieString) {
            const token = tokenCookieString.split("=")[1];

            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err;
                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    connection.on("message", async (message) => {
        handleMessage(message, connection, wss);
    });

    notifyAboutOnlinePeople(wss);
}

async function handleMessage(message, connection, wss) {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;

    if (file) {
        console.log("size", file.data.length);
        const parts = file.name.split(".");
        const ext = parts[parts.length - 1];
        filename = Date.now() + "." + ext;
        const path = __dirname + "/uploads/" + filename;
        const bufferData = new Buffer(file.data.split(",")[1], "base64");
        fs.writeFile(path, bufferData, () => {
            console.log("file saved:" + path);
        });
    }

    if (recipient && (text || file)) {
        const messageDoc = await MessageModel.create({
            sender: connection.userId,
            recipient,
            text,
            file: file ? filename : null,
        });

        console.log("created message");

        [...wss.clients]
            .filter((c) => c.userId === recipient)
            .forEach((c) =>
                c.send(
                    JSON.stringify({
                        text,
                        sender: connection.userId,
                        recipient,
                        file: file ? filename : null,
                        _id: messageDoc._id,
                    })
                )
            );
    }
}