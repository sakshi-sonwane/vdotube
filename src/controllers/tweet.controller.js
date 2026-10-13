import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (typeof content !== "string" || content.trim() === "") {
    throw new ApiError(400, "tweet content should not be empty");
  }

  if (content.trim().length > 280) {
    throw new ApiError(400, "tweet content cannot exceed 280 characters");
  }

  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, " user id not found");
  }

  const tweets = await Tweet.find({ owner: userId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "content is required");
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user._id },
    { $set: { content: content.trim() } },
    { new: true },
  );

  if (!tweet) {
    throw new ApiError(404, "tweet is not found or u are not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id");
  }

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(404, "tweet not found or u r not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});

export { createTweet, getUserTweet, updateTweet ,deleteTweet};
