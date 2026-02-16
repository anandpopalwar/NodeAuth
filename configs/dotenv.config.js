import { config } from "dotenv";

config();

export const { MONGODB_URI, NODE_ENV, PORT, JWT_SECRET_KEY } = process.env;
