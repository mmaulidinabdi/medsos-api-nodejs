import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { CreateFeed, detailFeeds, ReadAllFeeds } from "../controllers/feed.controller.js";

const FeedRouter = express.Router();

FeedRouter.post("/", AuthMiddleware, upload.single("feed"), CreateFeed);
FeedRouter.get("/", AuthMiddleware, ReadAllFeeds);
FeedRouter.get("/:id", AuthMiddleware,detailFeeds );

export default FeedRouter;
