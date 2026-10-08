import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllVideos } from "../controllers/video.controllers.js";

const router = Router();

// router.use((req, res, next) => {
//   console.log("video router hit:", req.method, req.url);
//   next();
// });
router.route("/get-videos").get(getAllVideos)


export default router