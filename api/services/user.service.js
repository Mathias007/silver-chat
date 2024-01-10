import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import UserModel from "../models/User.js";

import { ConfigVariables } from "../config/ConfigVariables.js";
import { ServerErrors } from "../config/ServerErrors.js";

const { jwtSecret } = ConfigVariables;

const { 
    REJECT_NO_TOKEN, 
    REGISTRATION_ERROR, 
    USER_ALREADY_EXISTS_ERROR 
} = ServerErrors;

const bcryptSalt = bcryptjs.genSaltSync(10);

export async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;

        if (token) {
            jwt.verify(token, jwtSecret, {}, (error, userData) => {
                if (error) console.error(error);
                resolve(userData);
            });
        } else {
            reject(REJECT_NO_TOKEN);
        }
    });
}

export const findUsers = async () => await UserModel.find({}, { _id: 1, username: 1 });

export const loginUser = async (username, password) => {
    const foundUser = await UserModel.findOne({ username });

    if (foundUser) {
        const passOk = bcryptjs.compareSync(password, foundUser.password);

        if (passOk) {
            const token = jwt.sign(
                { userId: foundUser._id, username },
                jwtSecret,
                {}
            );

            return { token, userId: foundUser._id };
        }
    }

    return null;
};

export const registerUser = async (username, password) => {
    try {
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return { error: USER_ALREADY_EXISTS_ERROR };
        }

        const hashedPassword = bcryptjs.hashSync(password, bcryptSalt);
        const createdUser = await UserModel.create({
            username: username,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { userId: createdUser._id, username },
            jwtSecret,
            {}
        );

        return { token, userId: createdUser._id };
    } catch (error) {
        console.error(error);
        return { error: REGISTRATION_ERROR };
    }
};
