import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    image: {
      type: String,
      default: "",
    },
    postType: {
      type: String,
      enum: ["general", "hiring"],
      default: "general",
    },
    hiringTitle: {
      type: String,
      trim: true,
      default: "",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    applyUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
