import { config } from "dotenv";

config();

export const { MONGODB_URI, NODE_ENV, PORT } = process.env;
