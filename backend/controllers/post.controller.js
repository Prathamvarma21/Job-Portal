import { Post } from "../models/post.model.js";
import { Job } from "../models/job.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { caption, postType = "general", hiringTitle = "", jobId = "", applyUrl = "" } = req.body;

    if (!caption || !caption.trim()) {
      return res.status(400).json({ message: "Post caption is required", success: false });
    }

    let job = null;
    if (jobId) {
      job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Selected job was not found", success: false });
      }
    }

    let image = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      image = cloudResponse.secure_url;
    }

    const post = await Post.create({
      author: req.id,
      caption: caption.trim(),
      image,
      postType,
      hiringTitle,
      job: job?._id || null,
      applyUrl,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "fullName role profile")
      .populate({
        path: "job",
        select: "title location jobType salary company",
        populate: { path: "company", select: "name" },
      });

    return res.status(201).json({
      message: "Post shared successfully",
      post: populatedPost,
      success: true,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "fullName role profile")
      .populate({
        path: "job",
        select: "title location jobType salary company",
        populate: { path: "company", select: "name" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts, success: true });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    if (post.author.toString() !== req.id) {
      return res.status(403).json({ message: "You can delete only your own posts", success: false });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Post deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
