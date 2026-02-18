import bcrypt, { compare } from "bcryptjs";
import UserModal from "../modals/user.modal.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../configs/dotenv.config.js";
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
      _err.message = "User already exists";
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
      message: username + " user created successfully",
    });
  } catch (err) {
    console.log(err);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    // err.message = err.message || "Somthing went wrong";
    next(err);
  } finally {
    await session.endSession();
  }
};

export const LoginUser = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    console.log(req.body);

    const { email, password } = req.body;

    console.log(email);
    const User = await UserModal.findOne({ email }).select("+password");
    console.log(User);
    if (User === null) {
      console.log("first");
      let _err = new Error();
      _err.message = "User dont exists";
      _err.statusCode = 404;
      throw _err;
    }

    const isPasswordCorrect = await compare(password, User.password);
    if (!isPasswordCorrect) {
      console.log("first");
      let _err = new Error();
      _err.message = "Wrong password";
      _err.statusCode = 400;
      throw _err;
    }

    let userObj = {
      username: User.username,
      _id: User._id,
    };

    const accessToken = jwt.sign(userObj, JWT_SECRET_KEY, {
      expiresIn: 2 * 60,
    });
    // const refreshToken = jwt.sign(userObj, JWT_SECRET_KEY, {
    //   expiresIn: "1d",
    // });

    userObj = { ...userObj, accessToken, email: User.email };
    delete userObj.password;

    console.log(userObj);
    console.log("User exist");

    // await UserModal.findOneAndUpdate({_id})

    await UserModal.findOneAndUpdate(
      { _id: userObj._id },
      {
        $set: {
          isActive: true,
          token: accessToken,
        },
      },
      {
        session,
        returnDocument: true,
        runValidators: true,
      },
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Use login successfully",
      body: { ...userObj },
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.log(err);
    next(err);
  } finally {
    await session.endSession();
  }
};

// server receive access/refresh token from client
// backend decode that token and get the _id of user
// and that token is removed from db and
// 1st if multidevice login system is there
//     then user active status will be handled
// 2nd if single divice login system is there
//     then false the user active status

export const LogoutUser = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { authorization } = req.headers;
    console.log(authorization);
    const token = authorization?.split(" ")[1];

    const User = await UserModal.findOneAndUpdate(
      { token: token },
      {
        $set: {
          isActive: false,
          token: null,
        },
      },
      { session, returnDocument: true },
    );

    console.log("XXXXXXXX", { User });

    if (User === null) {
      console.log("first");
      let _err = new Error();
      _err.message = "User dont exists";
      _err.statusCode = 404;
      throw _err;
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "User logout successfully",
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.log(err);
    next(err);
    console.log("Logout successfully");
  } finally {
    await session.endSession();
  }
};

export const getToken = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { authorization } = req.headers;
    console.log(authorization);
    const token = authorization?.split(" ")[1];

    const User = await UserModal.findOne({ token: token });

    if (User === null) {
      let _err = new Error();
      _err.message = "User dont exists";
      _err.statusCode = 404;
      throw _err;
    }

    let userObj = {
      username: User.username,
      _id: User._id,
    };

    const accessToken = jwt.sign(userObj, JWT_SECRET_KEY, {
      expiresIn: 2 * 60,
    });
    // const refreshToken = jwt.sign(userObj, JWT_SECRET_KEY, {
    //   expiresIn: "1d",
    // });

    userObj = { ...userObj, accessToken, email: User.email };

    // await UserModal.findOneAndUpdate({_id})

    await UserModal.findOneAndUpdate(
      { _id: userObj._id },
      {
        $set: {
          isActive: true,
          token: accessToken,
        },
      },
      {
        session,
        returnDocument: true,
        runValidators: true,
      },
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Token got successfully",
      body: { ...userObj },
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(err);
  } finally {
    session.endSession();
  }
};
