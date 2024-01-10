import jwt from "jsonwebtoken";

import {
    findUsers,
    loginUser,
    registerUser,
} from "../services/user.service.js";

import { ServerStatuses } from "../config/ServerStatuses.js";
import { ServerErrors } from "../config/ServerErrors.js";
import { ConfigVariables } from "../config/ConfigVariables.js";

const { OK, BAD_REQUEST, CREATED, INTERNAL_ERROR, UNAUTHORIZED } =
    ServerStatuses;

const {
    INTERNAL_SERVER_ERROR,
    AUTHORIZATION_GENERAL_ERROR,
    LOGOUT_MESSAGE,
    WRONG_CREDENTIAL_ERROR,
} = ServerErrors;

const { jwtSecret } = ConfigVariables;

export const getAllUsers = async (req, res) => {
    try {
        const users = await findUsers();
        res.status(OK).json(users);
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_ERROR).json({ error: INTERNAL_SERVER_ERROR });
    }
};

export const getUserDataByToken = (req, res) => {
    const token = req.cookies?.token;

    try {
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) {
                    console.error(err);
                    res.status(UNAUTHORIZED).json({
                        error: AUTHORIZATION_GENERAL_ERROR,
                    });
                } else {
                    res.status(OK).json(userData);
                }
            });
        } else {
            res.status(UNAUTHORIZED).json({
                error: AUTHORIZATION_GENERAL_ERROR,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_ERROR).json({ error: INTERNAL_SERVER_ERROR });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const authResult = await loginUser(username, password);

        if (authResult) {
            res.cookie("token", authResult.token, {
                sameSite: "none",
                secure: true,
            })
                .status(OK)
                .json({
                    id: authResult.userId,
                });
        } else {
            res.status(UNAUTHORIZED).json({ error: WRONG_CREDENTIAL_ERROR });
        }
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_ERROR).json({ error: INTERNAL_SERVER_ERROR });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("token", "", { sameSite: "none", secure: true })
            .status(OK)
            .json(LOGOUT_MESSAGE);
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_ERROR).json({ error: INTERNAL_SERVER_ERROR });
    }
};

export const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const registrationResult = await registerUser(username, password);

        if (registrationResult.token) {
            res.cookie("token", registrationResult.token, {
                sameSite: "none",
                secure: true,
            })
                .status(CREATED)
                .json({
                    id: registrationResult.userId,
                });
        } else {
            res.status(BAD_REQUEST).json({ error: registrationResult.error });
        }
    } catch (error) {
        console.error(error);
        res.status(INTERNAL_ERROR).json({ error: INTERNAL_SERVER_ERROR });
    }
};
