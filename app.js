import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import healthCheckRouter from "./src/routes/healthCheck.routes.js";
import userRouter from "./src/routes/user.routes.js";
import videoRouter from "./src/routes/video.routes.js";
import tweetRouter from "./src/routes/tweet.routes.js";
import subscriptionRouter from "./src/routes/subscription.routes.js";
import playlistRouter from "./src/routes/playlist.routes.js";

// create routes
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);

// Global error handler — must be the LAST app.use()
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.msg || err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
});

export { app };
