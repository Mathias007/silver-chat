import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

import MessageModel from "../models/Message.js";

import { ServerPaths } from "../config/ServerPaths.js";
import { ServerErrors } from "../config/ServerErrors.js";
import { wssIntervals, wssListeners } from "../config/WebSocketVariables.js";
import { AUTH_TOKEN, BUFFER_FORMAT } from "../config/ConfigVariables.js";

const { UPLOADS } = ServerPaths;
const { FILE_SAVED, FILE_SIZE, MESSAGE_CREATED } = ServerErrors;

const { CONNECTION, PONG, MESSAGE } = wssListeners;
const { CONNECTION_TIMER_INTERVAL, DEATH_TIMER_INTERVAL } = wssIntervals;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeWebSocket(server, jwtSecret) {
    const wss = new WebSocketServer({ server });

    wss.on(CONNECTION, (connection, req) => {
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
        }, DEATH_TIMER_INTERVAL);
    }, CONNECTION_TIMER_INTERVAL);

    connection.on(PONG, () => {
        clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;

    if (cookies) {
        const tokenCookieString = cookies
            .split(";")
            .find((str) => str.startsWith(`${AUTH_TOKEN}=`));
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

    connection.on(MESSAGE, async (message) => {
        handleMessage(message, connection, wss);
    });

    notifyAboutOnlinePeople(wss);
}

async function handleMessage(message, connection, wss) {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;

    if (file) {
        console.log(`${FILE_SIZE} ${file.data.length}`);
        const parts = file.name.split(".");
        const extension = parts[parts.length - 1];
        filename = `${Date.now()}.${extension}`;
        const filePath = path.join(__dirname, `..${UPLOADS}`, filename);
        const bufferData = new Buffer(file.data.split(",")[1], BUFFER_FORMAT);
        fs.writeFile(filePath, bufferData, () => {
            console.log(`${FILE_SAVED} ${filePath}`);
        });
    }

    if (recipient && (text || file)) {
        const messageDoc = await MessageModel.create({
            sender: connection.userId,
            recipient,
            text,
            file: file ? filename : null,
        });

        console.log(MESSAGE_CREATED);

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
