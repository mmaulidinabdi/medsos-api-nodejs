import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { ToggleBookmark } from "../controllers/bookmark.controller.js";
const BookmarkRouter = express.Router();

BookmarkRouter.post("/:postId", AuthMiddleware, ToggleBookmark);
BookmarkRouter.get("/", AuthMiddleware, );

export default BookmarkRouter;
