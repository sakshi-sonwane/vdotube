import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJwt, createPlaylist);
router.route("/:userId").get(verifyJwt, getUserPlaylist);
router.route("/playlist-byId/:playlistId").get(verifyJwt, getPlaylistById);
router.route("/add/:videoId/:playlistId").post(verifyJwt, addVideoToPlaylist);
router
  .route("/remove/:videoId/:playlistId")
  .patch(verifyJwt, removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(verifyJwt, deletePlaylist);
router.route("/update/:playlistId").patch(verifyJwt, updatePlaylist);


export default router;
