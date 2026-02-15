import { Router } from "express";
import { RegisterUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", RegisterUser);
authRouter.get("/login");
authRouter.get("/logout");
// authRouter.get("/deactivate", RegisterUser);

export default authRouter;
