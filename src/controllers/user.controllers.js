import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if ([fullname, username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user already exist");
  }

  const avatarLocalpath = req.files?.avatar?.[0]?.path;

  console.warn(req.files);

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalpath);
    console.log("uploaded avatar", avatar);
  } catch (error) {
    console.log("error uploading avatar", error);
    throw new ApiError(500, "failed to upload avatar");
  }

  if (!avatar) {
    throw new ApiError(400, "avatar upload failed");
  }

  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverImageLocalpath);
    console.log("uploaded coverimage", coverImage);
  } catch (error) {
    console.log("error uploading coverImage", error);
    throw new ApiError(500, "failed to upload cover image");
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPwdCorrect = await user.isPasswordCorrect(password);

  if (!isPwdCorrect) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await user
    .findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logges in succesfully",
      ),
    );
});

const generateAccessAndRefreshToken = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(user._id);
    const refreshToken = uaer.generateRefreshToken();
    const accessToken = uaer.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "somenthing went wrong while generating tokens");
  }
});

export { registerUser };
