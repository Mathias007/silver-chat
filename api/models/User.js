import mongoose from "mongoose";

import { DatabaseModels } from "../config/DatabaseModels.js";
const { USER } = DatabaseModels;

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, unique: true },
        password: String,
    },
    { timestamps: true }
);

const UserModel = mongoose.model(USER, UserSchema);

export default UserModel;
