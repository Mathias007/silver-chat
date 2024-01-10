import MessageModel from "../models/Message.js";
import { ServerErrors } from "../config/ServerErrors.js";

const { INTERNAL_SERVER_ERROR } = ServerErrors;

export const getUserMessages = async (userId, ourUserId) => {
    try {
        const messages = await MessageModel.find({
            sender: { $in: [userId, ourUserId] },
            recipient: { $in: [userId, ourUserId] },
        }).sort({ createdAt: 1 });

        return { messages };
    } catch (error) {
        console.error(error);
        return { error: INTERNAL_SERVER_ERROR };
    }
};
