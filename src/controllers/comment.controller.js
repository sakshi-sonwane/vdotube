import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Video } from "../models/video.models.js";

const addComment = asyncHandler(async (req, res) => {
  // add cmt to a vdo

  const { content } = req.body;
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const trimmedContent = content.trim();

  if (typeof content !== "string" || trimmedContent === "") {
    throw new ApiError(400, "comment content should not be empty");
  }

  if (trimmedContent.length > 280) {
    throw new ApiError(400, "comment content cannot exceed 280 characters");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }

  const trimmedContent =
    typeof content === "string" ? content.trim().replace(/[ \t]+/g, " ") : "";

  if (!trimmedContent) {
    throw new ApiError(400, "comment content should not be empty");
  }

  if (trimmedContent.length > 280) {
    throw new ApiError(400, "comment content cannot exceed 280 characters");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user._id },
    { $set: { content: trimmedContent } },
    { new: true },
  );

  if (!updatedComment) {
    throw new ApiError(404, "comment is not found or u are not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!deletedComment) {
    throw new ApiError(400, "comment not found or u r not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  // get all comments for a video

  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is not valid");
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalComments, comments, page: Number(page), limit: Number(limit) },
        "comments fetched successfully",
      ),
    );
});

export { addComment, updateComment, deleteComment, getVideoComments };
