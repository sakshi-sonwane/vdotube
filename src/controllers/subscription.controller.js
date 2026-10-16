import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channle id is invalid");
  }

  //   khud ka channel subscribe ni kr skte
  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "u cannot subscribe ur own channel");
  }

  // check kro ki channel already subscribed h ky logged in user se
  const alreadySubscribed = await Subscription.findOne({
    Subscriber: req.user._id,
    channel: channelId,
  });

  //   already subs h to unsubs krna
  if (alreadySubscribed) {
    await Subscription.findOneAndDelete(alreadySubscribed._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unsubscribed successfully"));
  }

  //   agr nhi h subs to
  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username fullName avatar")
    .sort({
      createdAt: -1,
    });

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalSubscribers, subscribers },
        "subscribers fetched successfully",
      ),
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid subscriber id");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  })
    .populate("channel", "username fullName avatar")
    .sort({
      createdAt: -1,
    });

  const totalChannelSubscribed = await Subscription.countDocuments({
    subscriber: subscriberId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalChannelSubscribed, subscribedChannels },
        "channels subscribed fetched successfully",
      ),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
