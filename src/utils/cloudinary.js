import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "dotenv/config";

// Pehle env check, phir config
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Cloudinary env variables are missing! Check your .env file.",
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Local file safely delete karta hai (fail ho to bhi crash nahi hoga)
const removeLocalFile = (path) => {
  try {
    if (path && fs.existsSync(path)) fs.unlinkSync(path);
  } catch (err) {
    console.error("Local file cleanup failed:", err);
  }
};

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null; // caller checks for missing path

  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log(
      "file uploaded successfully on cloudinary " + uploadResult.secure_url,
    );
    removeLocalFile(localFilePath);
    return uploadResult;
  } catch (error) {
    console.log("Cloudinary upload error:", error?.message || error);
    removeLocalFile(localFilePath);
    throw error; // re-throw so controller gets the real failure reason
  }
};

// URL se resource_type aur public_id nikalta hai
// https://res.cloudinary.com/<cloud>/image/upload/v123/folder/abc.jpg
//   -> { resourceType: "image", publicId: "folder/abc" }
const parseCloudinaryUrl = (url) => {
  const match = url.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?([^?#]+)$/);
  if (!match) return null;

  const resourceType = match[1];
  let publicId = decodeURIComponent(match[2]);

  // raw files (pdf, zip etc.) me public_id ke saath extension hota hai
  if (resourceType !== "raw") {
    publicId = publicId.replace(/\.[^/.]+$/, "");
  }
  return { resourceType, publicId };
};

// Fail hone par error throw karta hai, taki controller ka try/catch kaam kare
const deleteFromCloudinary = async (url) => {
  if (!url) return;

  const parsed = parseCloudinaryUrl(url);
  if (!parsed) throw new Error(`Invalid Cloudinary URL: ${url}`);

  const result = await cloudinary.uploader.destroy(parsed.publicId, {
    resource_type: parsed.resourceType,
    invalidate: true, // CDN cache bhi clear ho
  });

  console.log("delete result =", result);

  // destroy() "not found" par bhi throw nahi karta, isliye result check karo
  if (result.result !== "ok") {
    throw new Error(`Cloudinary delete failed (${result.result}) for ${url}`);
  }
  return result;
};

export { uploadOnCloudinary, deleteFromCloudinary };
