const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary and update database
 */
async function uploadImageToCloudinary(entityId, filename, tableName, model) {
  console.log("Inside uploadImageToCloudinary", entityId, filename);
  const filePath = path.join(__dirname, "..", "uploads", filename);
  console.log("filePath", filePath);
  console.log("fileExists", fs.existsSync(filePath));

  try {
    const file = `./uploads/${filename}`;
    console.log("file", file);

    const uploadedImageResult = await cloudinary.uploader.upload(file);
    console.log(uploadedImageResult);

    const optimizedImageUrl = cloudinary.url(uploadedImageResult.public_id, {
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
        {
          width: 200,
          height: 200,
          crop: "fill",
          gravity: "auto",
        },
      ],
    });
    console.log(optimizedImageUrl);

    const updatedData = {
      optimizedImageUrl: optimizedImageUrl || "",
      secureUrl: uploadedImageResult?.secure_url || "",
      publicId: uploadedImageResult?.public_id || "",
      imagesDisplayName: uploadedImageResult?.display_name || "",
      imageUrl: uploadedImageResult?.url || "",
    };

    const updatedEntity = await model.update(entityId, updatedData);
    console.log(updatedEntity);

    // Delete local file
    try {
      fs.unlinkSync(path.join(__dirname, "..", "uploads", filename));
    } catch (error) {
      console.log("Error in deleting image", error);
    }

    return true;
  } catch (error) {
    console.log("Error in uploading image to cloudinary", error);
    return false;
  }
}

/**
 * Delete image from Cloudinary
 */
async function deleteImageFromCloudinary(publicId) {
  try {
    const deletedImage = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    console.log("Deleted image from cloudinary:", deletedImage);
    return true;
  } catch (error) {
    console.log("Error in deleting image from cloudinary", error);
    return false;
  }
}

module.exports = {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};

