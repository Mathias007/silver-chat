import express from "express";
import { getUserMessagesById } from "../controllers/message.controller.js";

const app = express.Router();

app.get("/messages/:userId", getUserMessagesById);

export default app;
