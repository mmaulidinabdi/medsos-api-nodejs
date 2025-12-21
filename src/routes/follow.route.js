import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { followUserAccount, unfollowUserAccount } from "../controllers/follow.controller.js";

const FollowRouter = express.Router();

FollowRouter.post("/", AuthMiddleware, followUserAccount);
FollowRouter.delete("/:unfollowUserId", AuthMiddleware, unfollowUserAccount);

export default FollowRouter;