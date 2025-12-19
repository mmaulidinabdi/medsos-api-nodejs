import express from "express";
import { getUserByUsername, searchUser, updateUser } from "../controllers/user.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const UserRouter = express.Router();

UserRouter.get("/search",searchUser);
UserRouter.get("/:username",getUserByUsername);
UserRouter.put("/update-user", AuthMiddleware,updateUser);


export default UserRouter;