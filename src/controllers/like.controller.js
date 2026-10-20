import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  // video database me hai ya nahi
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // check kro ki vdo already liked h ky logged in user se
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  //   already liked h to unliked krna
  if (alreadyLiked) {
    await Like.findOneAndDelete({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unliked successfully"));
  }

  //   agr nhi h liked to
  await Like.create({
    likedBy: req.user._id,
    video: videoId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }

  // video database me hai ya nahi
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  // check kro ki comment already liked h ky logged in user se
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });

  //   already liked h to unliked krna
  if (alreadyLiked) {
    await Like.findOneAndDelete({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unliked successfully"));
  }

  //   agr nhi h liked to
  await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  // video database me hai ya nahi
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  // check kro ki comment already liked h ky logged in user se
  const alreadyLiked = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  //   already liked h to unliked krna
  if (alreadyLiked) {
    await Like.findOneAndDelete({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unliked successfully"));
  }

  //   agr nhi h liked to
  await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true, $ne: null },
  })

    .populate("video")
    .sort({ createdAt: -1 });

  const likedVideos = likes
    .map((like) => like.video)
    .filter((video) => video != null);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully"),
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
