import { Router } from "express";
import { LoginUser, LogoutUser, RegisterUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", RegisterUser);
authRouter.get("/login",LoginUser);
authRouter.delete("/logout/:id",LogoutUser);
// authRouter.get("/deactivate", RegisterUser);

export default authRouter;
