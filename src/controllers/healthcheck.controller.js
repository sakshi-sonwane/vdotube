import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (Req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "health check passed"));
});

export {healthCheck}