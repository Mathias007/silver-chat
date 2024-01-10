import mongoose from "mongoose";

import { DatabaseModels } from "../config/DatabaseModels.js";
const { MESSAGE, USER } = DatabaseModels;

const MessageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: USER },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: USER },
        text: String,
        file: String,
    },
    { timestamps: true }
);

const MessageModel = mongoose.model(MESSAGE, MessageSchema);

export default MessageModel;
