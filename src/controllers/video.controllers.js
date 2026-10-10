import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { upload } from "../middlewares/multer.middleware.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // filter
  const filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    filter.owner = userId;
  }

  //  sorting
  const sortField = sortBy || "createdAt";
  const sortOrder = sortType === "asc" ? 1 : -1;

  // pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  // DB se vdos nikalo

  const videos = await Video.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limitNum);

  // total vdos gino
  const totalVideos = await Video.countDocuments(filter);

  console.log("videos fetched successfully");

  // response bhejo
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limitNum),
        currentPage: pageNum,
      },
      "Videos fetched successfully",
    ),
  );
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "both fields are required");
  }

  const vdoThumbnail = req.files?.thumbnail?.[0]?.path;
  const vdoFile = req.files?.videoFile?.[0]?.path;

  if (!vdoThumbnail || !vdoFile) {
    throw new ApiError(400, "paths are required");
  }

  const uploadedThumbnail = await uploadOnCloudinary(vdoThumbnail);
  const uploadedFile = await uploadOnCloudinary(vdoFile);

  if (!uploadedThumbnail || !uploadedFile) {
    throw new ApiError(500, "files not upload");
  }

  const videoPublished = await Video.create({
    title,
    description,
    thumbnail: uploadedThumbnail.url,
    videoFile: uploadedFile.url,
    duration: uploadedFile.duration,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, videoPublished, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  // or const {videoId}=req.params esa bhi likh skte h

  const validVdoId = mongoose.isValidObjectId(videoId);

  if (validVdoId === false) {
    throw new ApiError(400, "video id is invalid");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video id fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const validId = mongoose.isValidObjectId(videoId);

  if (validId === false) {
    throw new ApiError(400, "video id is invalid");
  }

  const { title, description } = req.body;
  const thumbnaillocalpath = req.file?.path;

  if (!thumbnaillocalpath && !title && !description) {
    throw new ApiError(400, "nothing to update");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }
  const oldThumbnail = video.thumbnail;

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not allowed to update this video");
  }

  let updateFields = {};

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  if (thumbnaillocalpath) {
    const uploaded = await uploadOnCloudinary(thumbnaillocalpath);

    if (!uploaded?.url) {
      throw new ApiError(500, "thumbnail upload failed");
    }

    updateFields.thumbnail = uploaded.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    { new: true },
  );

  // naya thumbnail aaya ho tabhi purana delete karo
  if (thumbnaillocalpath && oldThumbnail) {
    try {
      await deleteFromCloudinary(oldThumbnail);
    } catch (err) {
      console.error("Old thumbnail delete failed:", err);
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedVideo },
        "video fields updated successfully",
      ),
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const validId = mongoose.isValidObjectId(videoId);

  if (validId === false) {
    throw new ApiError(400, "invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video id not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not allowed to delete this video");
  }

  const [vdo, thumb] = await Promise.all([
    deleteFromCloudinary(video.videoFile),
    deleteFromCloudinary(video.thumbnail),
  ]);

  if (!vdo || !thumb) {
    throw new ApiError(500, "Failed to delete files from Cloudinary");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "files deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "user is unmatched");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        "Video publish status toggled successfully",
      ),
    );
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
};
