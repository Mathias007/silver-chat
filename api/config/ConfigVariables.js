import dotenv from "dotenv";

dotenv.config();

export const ConfigVariables = {
    connectionString: process.env.DB_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    clientURL: process.env.CLIENT_URL,
    portNumber: process.env.PORT_NUMBER,
};

export const AUTH_TOKEN = "token";
export const BUFFER_FORMAT = "base64";
export const BCRYPT_SALT_ROUNDS = 10
