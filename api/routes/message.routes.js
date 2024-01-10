import express from "express";
import { getUserMessagesById } from "../controllers/message.controller.js";

import { ServerPaths } from "../config/ServerPaths.js";
const { MESSAGES } = ServerPaths;

const app = express.Router();

app.get(`${MESSAGES}/:userId`, getUserMessagesById);

export default app;
