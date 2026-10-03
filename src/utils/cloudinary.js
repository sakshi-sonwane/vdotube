import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
},
console.log("env files loaded successfully")
);

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Cloudinary env variables are missing! Check your .env file.",
  );
}

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file uploaded successfully on cloudinary " + uploadResult.url);
    // once file is uploaded it should be deleted from the server
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    console.log(
      "Cloudinary upload error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export {uploadOnCloudinary}