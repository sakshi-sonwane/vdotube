import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controllers.js";
import { Router } from "express";

const router = Router();

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

export default router