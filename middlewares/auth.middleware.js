import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../configs/dotenv.config.js";

const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    // console.log("authorizationXX", authorization);

    const token = authorization?.split(" ")[1];

    if (!authorization || !authorization.startsWith("Bearer")) {
      let _err = new Error();
      _err.message = "No token provided";
      _err.statusCode = 401;
      throw _err;
    }

    // if (  !token) {
    //   let _err = new Error();
    //   _err.message = "Unauthorized access";
    //   _err.statusCode = 401;

    //   throw _err;
    // }

    console.log({ token });

    const decoded = jwt.verify(token, JWT_SECRET_KEY, (err) => {
      if (err) throw err;
    });

    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    if (err.name === "TokenExpiredError") {
      err.message = "Access token expired";
      err.statusCode = 401;
    } else {
      err.message = "Invalid token";
      err.statusCode = 401;
    }

    next(err);
  }
};

export default authMiddleware;
