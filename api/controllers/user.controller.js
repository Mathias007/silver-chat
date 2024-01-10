import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import UserModel from "../models/User.js";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcryptjs.genSaltSync(10);

export async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;

        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            });
        } else {
            reject("no token");
        }
    });
}

export const getAllUsers = async (req, res) => {
    const users = await UserModel.find({}, { _id: 1, username: 1 });

    res.json(users);
};

export const getUserDataByToken = (req, res) => {
    const token = req.cookies?.token;

    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    } else {
        res.status(401).json("no token");
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await UserModel.findOne({ username });

    if (foundUser) {
        const passOk = bcryptjs.compareSync(password, foundUser.password);

        if (passOk) {
            jwt.sign(
                { userId: foundUser._id, username },
                jwtSecret,
                {},
                (err, token) => {
                    res.cookie("token", token, {
                        sameSite: "none",
                        secure: true,
                    }).json({
                        id: foundUser._id,
                    });
                }
            );
        }
    }
};

export const logout = (req, res) => {
    res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
};

export const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "Użytkownik o podanym username już istnieje." });
        }

        const hashedPassword = bcryptjs.hashSync(password, bcryptSalt);
        const createdUser = await UserModel.create({
            username: username,
            password: hashedPassword,
        });

        jwt.sign(
            { userId: createdUser._id, username },
            jwtSecret,
            {},
            (err, token) => {
                if (err) throw err;
                res.cookie("token", token, { sameSite: "none", secure: true })
                    .status(201)
                    .json({
                        id: createdUser._id,
                    });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json("Wystąpił błąd podczas rejestracji.");
    }
};
