import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const videos = await Video.find({ owner: channelId });
  const totalVdoViews = videos.reduce((acc, video) => acc + video.views, 0);

  const vdoIds = videos.map((video) => video._id) 
  const totalLikes= await Like.countDocuments({video: {$in: vdoIds}})

  const totalVdos= videos.length;

  console.log(channelId);
  

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalSubscribers, totalLikes, totalVdoViews, totalVdos },
        "data fetched successfully",
      ),
    );
});


export {getChannelStats}