import {
  createTweet,
  deleteTweet,
  getUserTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/create-tweet").post(verifyJwt, createTweet);
router.route("/:userId").get(verifyJwt, getUserTweet);
router.route("/:tweetId").patch(verifyJwt, updateTweet);
router.route("/delete/:tweetId").post(verifyJwt, deleteTweet);

export default router;
