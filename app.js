import "./configs/dotenv.config.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import { NODE_ENV, PORT } from "./configs/dotenv.config.js";
import connectToMongoDB from "./databases/mongo.database.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import RandomDataRoute from "./routes/randomdata.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";

console.log(NODE_ENV, PORT);
const app = express();
app.use(cors());
//middleware for parsing data
app.use(express.json());

app.get("/", (req, res) => {
  console.log(req, res);
  res.send("Hello");
});
app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/randomdata/", authMiddleware, RandomDataRoute);
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log("Server is running on PORT:", PORT, " on ", NODE_ENV);
  await connectToMongoDB();
});
