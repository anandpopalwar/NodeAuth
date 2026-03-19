import bcrypt, { compare } from "bcryptjs";
import UserModal from "../modals/user.modal.js";
import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_SECRET_KEY,
} from "../configs/dotenv.config.js";
import axios from "axios";
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

export const LoginWithGoogle = async (req, res, next) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      let err = new Error();
      err.message = "Somthing went Wrong, Server Creds not found!";
      err.statusCode = 404;
      throw err;
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
    });
    res.status(200).json({
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    });
  } catch (err) {
    console.log(err);
    next(err);
    console.log("Logout successfully");
  }
};
export const GoogleLogin = async (req, res, next) => {
  const session = await new mongoose.startSession();
  try {
    session.startTransaction();
    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      let err = new Error();
      err.message = "Somthing went Wrong, Server Creds not found!";
      err.statusCode = 404;
      throw err;
    }

    const { code } = req.headers;
    if (!code) return res.status(400).json({ error: "No code provided" });
    console.log(code);

    const { data: tokenData } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
    );

    console.log(tokenData);

    // Get user profile from Google
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );

    console.log(profile);
    const User = await UserModal.findOneAndUpdate(
      {
        email: profile.email,
      },
      {
        username: profile.email,
        email: profile.email,
        isActive: true,
      },
      {
        upsert: true,
        new: true,
        session,
        returnDocument: true,
        runValidators: false,
      },
    );

    let userObj = {
      username: User.username,
      _id: User._id,
    };

    const accessToken = jwt.sign(userObj, JWT_SECRET_KEY, {
      expiresIn: 2 * 60,
    });

    await UserModal.findOneAndUpdate(
      {
        email: profile.email,
      },
      {
        token: accessToken,
      },
      {
        session,
      },
    );

    userObj = { ...userObj, accessToken, email: User.email };

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Use login successfully",
      body: { ...userObj },
    });
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
    next(err);
    console.log("Logout successfully");
  }
};
