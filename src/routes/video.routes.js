import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// router.use((req, res, next) => {
//   console.log("video router hit:", req.method, req.url);
//   next();
// });
router.route("/get-videos").get(getAllVideos);
router.route("/publish-video").post(
  verifyJwt,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo,
);

router.route("/get-videos/:videoId").get(getVideoById);

router
  .route("/:videoId")
  .patch(verifyJwt, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJwt, togglePublishStatus);
export default router;
