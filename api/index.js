import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { fileURLToPath } from "url";

import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { initializeWebSocket } from "./handlers/websocketHandler.js";

import { ConfigVariables } from "./config/ConfigVariables.js";
import { ServerPaths } from "./config/ServerPaths.js";

const { connectionString, clientURL, jwtSecret, portNumber } = ConfigVariables;
const { ROOT, UPLOADS } = ServerPaths;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(connectionString);

const app = express();
app.use(UPLOADS, express.static(`${__dirname}${UPLOADS}`));
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: clientURL,
    })
);

app.use(ROOT, userRoutes);
app.use(ROOT, messageRoutes);

const server = app.listen(portNumber);

initializeWebSocket(server, jwtSecret);
