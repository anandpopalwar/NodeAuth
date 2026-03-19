import { config } from "dotenv";

config();

export const {
  MONGODB_URI,
  NODE_ENV,
  PORT,
  JWT_SECRET_KEY,

  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;
