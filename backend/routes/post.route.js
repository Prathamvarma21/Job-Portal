import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";
import { createPost, deletePost, getAllPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, singleUpload, createPost);
router.route("/get").get(getAllPosts);
router.route("/:id").delete(isAuthenticated, deletePost);

export default router;
