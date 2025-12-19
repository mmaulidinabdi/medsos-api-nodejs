import express from "express";
import { getUserByUsername, searchUser } from "../controllers/user.controller.js";

const UserRouter = express.Router();

UserRouter.get("/search",searchUser);
UserRouter.get("/:username",getUserByUsername)


export default UserRouter;