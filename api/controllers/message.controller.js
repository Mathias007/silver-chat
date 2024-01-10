import { getUserMessages } from "../services/message.service.js";
import { getUserDataFromRequest } from "../services/user.service.js";

import { ServerStatuses } from "../config/ServerStatuses.js";

const { OK, INTERNAL_ERROR } = ServerStatuses;

export const getUserMessagesById = async (req, res) => {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;

    const messageResult = await getUserMessages(userId, ourUserId);

    if (messageResult.messages) {
        res.status(OK).json(messageResult.messages);
    } else {
        res.status(INTERNAL_ERROR).json({ error: messageResult.error });
    }
};
