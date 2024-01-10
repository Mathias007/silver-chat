import MessageModel from "../models/Message.js";

import { getUserDataFromRequest } from "./user.controller.js";

export const getUserMessagesById = async (req, res) => {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;

    const messages = await MessageModel.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });

    res.json(messages);
};
