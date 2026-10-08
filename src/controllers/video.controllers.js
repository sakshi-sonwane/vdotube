import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

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

const publishVideo = asyncHandler(async (req, res) => {});

const viewsOnVideo = asyncHandler(async (req, res) => {});

const getVideoById = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {});
const getVideoTitle = asyncHandler(async (req, res) => {});
const getVideoOwner = asyncHandler(async (req, res) => {});
const getDescriptionVdo = asyncHandler(async (req, res) => {});
const getDurationVdo = asyncHandler(async (req, res) => {});
const updateVdo = asyncHandler(async (req, res) => {});
const getLikedVdo = asyncHandler(async (req, res) => {});

export {
  getAllVideos,
  publishVideo,
  viewsOnVideo,
  getVideoById,
  deleteVideo,
  getVideoTitle,
  getVideoOwner,
  getDescriptionVdo,
  getDurationVdo,
  updateVdo,
  getLikedVdo,
};
