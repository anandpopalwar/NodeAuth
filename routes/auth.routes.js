import { Router } from "express";
import { LoginUser, RegisterUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", RegisterUser);
authRouter.get("/login",LoginUser);
authRouter.get("/logout");
// authRouter.get("/deactivate", RegisterUser);

export default authRouter;
