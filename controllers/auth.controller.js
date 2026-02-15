import bcrypt from "bcryptjs";
import UserModal from "../modals/user.modal.js";
import mongoose from "mongoose";

export const RegisterUser = async (req, res, next) => {
  // session can be used for to manage a crud w db
  // eg if somthing happened while performing crud in db to
  // abort the crud operation or complete the operation

  // need to start session
  const session = await mongoose.startSession();

  try {
    const { username, email, password } = req.body;
    console.log({ username, email, password });

    session.startTransaction();
    const User = await UserModal.exists({ email });
    console.log(User);

    if (User) {
      console.log("user exist");
      let _err = new Error();
      _err.messege = "User already exists";
      _err.statusCode = 409;
      throw _err;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log(hash);

    const newUser = await UserModal.create(
      [
        {
          username,
          email,
          password: hash,
        },
      ],
      {
        session,
      },
    );

    console.log(newUser);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      messege: "User created successfully",
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    // err.messege = err.messege || "Somthing went wrong";
    next(err);
  } finally {
    await session.endSession();
  }
};
