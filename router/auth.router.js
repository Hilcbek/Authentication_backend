import express from "express";
import {
  Delete,
  LoginWithGoogle,
  SignIn,
  SignOut,
  SignUp,
  Update,
} from "../controller/auth.controller.js";
import { verifyToken } from "../Token/token.js";
export let authRouter = express.Router();
authRouter.post("/sign-up", SignUp);
authRouter.post("/sign-in", SignIn);
authRouter.post("/google-sign-in", LoginWithGoogle);
authRouter.put("/update/:id", verifyToken, Update);
authRouter.delete("/delete/:id", verifyToken, Delete);
authRouter.post("/signOut",SignOut);