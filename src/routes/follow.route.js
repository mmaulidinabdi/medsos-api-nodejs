import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { followUserAccount } from "../controllers/follow.controller.js";

const FollowRouter = express.Router();

FollowRouter.post("/", AuthMiddleware, followUserAccount);

export default FollowRouter;