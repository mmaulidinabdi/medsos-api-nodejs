import express from "express";
import { getUser, LoginUser, RegisterUser } from "../controllers/auth.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", RegisterUser);
AuthRouter.post("/login", LoginUser);
AuthRouter.get("/me",AuthMiddleware, getUser);

export default AuthRouter;