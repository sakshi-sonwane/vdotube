import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { Router } from "express";

const router = Router();

router.route("/:channelId").patch(verifyJwt, toggleSubscription);
router
  .route("/get-subscribers/:channelId")
  .get(verifyJwt, getUserChannelSubscribers);

router
  .route("/get-subscribed-channels/:subscriberId")
  .get(verifyJwt, getSubscribedChannels);

export default router;
