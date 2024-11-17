import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localfilePath) => {
    if(!localfilePath) return null;
  try {
    // upload file to cloudinary
   const response = await cloudinary.uploader.upload(localfilePath, {
        resource_type: "auto"
    });
    console.log("this is the response from the cloudinary", response);
    return response;

  } catch (error) {
    fs.unlinkSync(localfilePath);
    return null; 
  }
};
