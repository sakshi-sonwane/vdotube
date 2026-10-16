import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "both are required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user id  or user id not found");
  }

  const userPlaylist = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "user fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid palylist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid playlist and video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    {
      $addToSet: { videos: videoId },
    },
    { new: true },
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or you are not the owner");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "video added to playlist successfully"),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid playlist or video id");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $pull: { videos: videoId } },
    { new: true },
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner pr playlist has been deleted",
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "playlist not found or u r not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "both are required");
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $set: { name: name.trim(), description: description.trim() } },
    { new: true },
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "playlist is not found or u are not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
