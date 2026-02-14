import mongoose from "mongoose";
import { MONGODB_URI } from "../configs/dotenv.config.js";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connection to Mongodb is successfull");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default connectToMongoDB;
