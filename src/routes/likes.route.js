import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { CheckLikeUser, LikeFeedUser } from "../controllers/likes.controller.js";

const LikeRouter = express.Router();

LikeRouter.post('/:postId',AuthMiddleware,LikeFeedUser);
LikeRouter.get('/:postId',AuthMiddleware,CheckLikeUser);

export default LikeRouter;