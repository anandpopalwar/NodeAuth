import { model, Schema } from "mongoose";

const UserSchema = new Schema(
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
      type: String,
      required: [true, "password is required"],
      trim: true,
      match: [
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "password is not valid",
      ],
      minLength: 6,
      select: false, // password wont come in queries bydefault
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },
    token: {
      type: String,
      required: false,
    },
    googleId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

const UserModal = new model("user", UserSchema);

export default UserModal;

// const db = {};
// db.createColletion("public", {
//   validator: {
//     $jsonSchema: {
//       required: ["name", "age"],
//       properties: {
//         name: {
//           bsonType: "string",
//           description: "must be a string",
//         },
//         age: {
//           bsonType: "number",
//           description: "must be a number",
//         },
//       },
//     },
//   },
// });
