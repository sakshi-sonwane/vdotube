import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/v/:videoId").post(verifyJwt, toggleVideoLike);
router.route("/c/:commentId").post(verifyJwt, toggleCommentLike);
router.route("/t/:tweetId").post(verifyJwt, toggleTweetLike);
router.route("/l/videos").get(verifyJwt, getLikedVideos);

export default router;
