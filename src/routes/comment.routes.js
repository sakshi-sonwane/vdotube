import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controller.js";
import { Router } from "express";

const router = Router();

router.route("/add/:videoId").post(verifyJwt, addComment);
router.route("/update/:commentId").patch(verifyJwt, updateComment);
router.route("/delete/:commentId").delete(verifyJwt, deleteComment);
router.route("/:videoId").get(verifyJwt, getVideoComments);

export default router;
