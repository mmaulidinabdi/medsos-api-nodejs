import express from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { CreateFeed } from '../controllers/feed.controller.js';

const FeedRouter = express.Router();

FeedRouter.post('/',AuthMiddleware,upload.single('feed'),CreateFeed);

export default FeedRouter;