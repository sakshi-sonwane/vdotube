import { upload } from "../middlewares/multer.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  newAccessTokenGeneration,
  registerUser,
  updateAccountDetails,
  updateCoverImage,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// unsecured routes
router.route("/registerUser").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(newAccessTokenGeneration);
router.route("/change-pwd").post(verifyJwt, changeCurrentPassword);

router.route("/getCurrent-user").get(verifyJwt, getCurrentUser);
router.route("/channel/:username").get(verifyJwt, getUserChannelProfile);
router.route("/get-watch-history/:user").get(verifyJwt, getWatchHistory);

router.route("/update-account-details").patch(verifyJwt, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-coverImage")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);

export default router;
