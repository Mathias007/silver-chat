import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { fileURLToPath } from "url";

import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { initializeWebSocket } from "./handlers/websocketHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
mongoose.connect(process.env.DB_CONNECTION_STRING);

const jwtSecret = process.env.JWT_SECRET;

const app = express();
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
    })
);

app.use("/", userRoutes);
app.use("/", messageRoutes);

const server = app.listen(4040);

initializeWebSocket(server, jwtSecret);
