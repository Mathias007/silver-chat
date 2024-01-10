import express from "express";
import {
    getAllUsers,
    getUserDataByToken,
    login,
    logout,
    register,
} from "../controllers/user.controller.js";

const app = express.Router();

app.get("/people", getAllUsers);

app.get("/profile", getUserDataByToken);

app.post("/login", login);

app.post("/logout", logout);

app.post("/register", register);

export default app;
