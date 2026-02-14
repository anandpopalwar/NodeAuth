import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      trim: true,
      unique: true,
      minLength: 3,
      maxLength: 15,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "email is not valid"],
      lowercase: true,
    },
    password: {
      type: true,
      required: [true, "password is required"],
      trim: true,
      match: [
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "password is not valid",
      ],
      minLength: 6,
      select: false, // password wont come in queries bydefault
    },
  },
  {
    timestamps: true,
  },
);

const UserModal = new mongoose.Model("user", UserSchema);

export default UserModal;
