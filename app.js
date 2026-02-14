import "./configs/dotenv.config.js";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import { NODE_ENV, PORT } from "./configs/dotenv.config.js";
import connectToMongoDB from "./databases/mongo.database.js";

const app = express();

app.get("/", (req, res) => {
  console.log(req, res);
  res.send("Hello");
});

app.use("/api/v1/auth/", authRouter);

app.listen(PORT, async () => {
  console.log("Server is running on PORT:", PORT, " on ", NODE_ENV);
  await connectToMongoDB();
});
