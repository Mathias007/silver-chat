import dotenv from "dotenv";

dotenv.config();

export const ConfigVariables = {
    connectionString: process.env.DB_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    clientURL: process.env.CLIENT_URL,
    portNumber: process.env.PORT_NUMBER,
};
