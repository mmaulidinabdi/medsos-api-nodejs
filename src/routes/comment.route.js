import express from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { createComment } from '../controllers/comment.controller.js';

const CommentRouter = express.Router();

CommentRouter.post("/",AuthMiddleware,createComment)

export default CommentRouter;