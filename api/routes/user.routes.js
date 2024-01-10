import express from "express";
import {
    getAllUsers,
    getUserDataByToken,
    login,
    logout,
    register,
} from "../controllers/user.controller.js";

import { ServerPaths } from "../config/ServerPaths.js";
const { PEOPLE, PROFILE, LOGIN, LOGOUT, REGISTER } = ServerPaths;

const app = express.Router();

app.get(PEOPLE, getAllUsers);
app.get(PROFILE, getUserDataByToken);
app.post(LOGIN, login);
app.post(LOGOUT, logout);
app.post(REGISTER, register);

export default app;
