import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (image, imageName, folder) => {
  try {
    const result = await cloudinary.v2.uploader.upload(image, {
      folder,
      public_id: imageName,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      quality: "auto",
      format: "webp",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Image upload failed");
  }
};
