import { Router } from "express";
import {
  getToken,
  GoogleLogin,
  LoginUser,
  LoginWithGoogle,
  LogoutUser,
  RegisterUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", RegisterUser);
authRouter.post("/login", LoginUser);
authRouter.post("/login/google/url", LoginWithGoogle);
authRouter.post("/login/google", GoogleLogin);
authRouter.delete("/logout", LogoutUser);
authRouter.get("/refresh", getToken);
// authRouter.get("/deactivate", RegisterUser);

export default authRouter;
