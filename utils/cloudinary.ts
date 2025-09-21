import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  buffer: Buffer,
  imageName: string,
  folder: string,
): Promise<{ url: string; public_id: string }> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder,
          public_id: imageName,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          quality: "auto",
          format: "avif",
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading image to Cloudinary:", error);
            reject(new Error("Image upload failed"));
          } else {
            resolve({
              url: result!.secure_url,
              public_id: result!.public_id,
            });
          }
        },
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};
