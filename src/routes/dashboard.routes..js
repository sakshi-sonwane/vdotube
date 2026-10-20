import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getChannelStats } from "../controllers/dashboard.controller.js";
import { Router } from "express";

const router=Router()

router.route("/").get(verifyJwt,getChannelStats)

export default router;