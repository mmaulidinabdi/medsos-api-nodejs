import express from "express";
import { getUserByUsername, searchUser, updateAvatar, updateUser } from "../controllers/user.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const UserRouter = express.Router();

UserRouter.get("/search",searchUser);
UserRouter.get("/:username",getUserByUsername);
UserRouter.put("/update-user", AuthMiddleware,updateUser);
UserRouter.patch("/update-avatar", AuthMiddleware, upload.single("image"),updateAvatar);


export default UserRouter;