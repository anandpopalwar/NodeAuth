import { Router } from "express";
import { getToken, LoginUser, LogoutUser, RegisterUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", RegisterUser);
authRouter.post("/login",LoginUser);
authRouter.delete("/logout",LogoutUser);
authRouter.get("/refresh",getToken);
// authRouter.get("/deactivate", RegisterUser);

export default authRouter;
