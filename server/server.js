require("dotenv").config();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async function () {
  const deletedImage = await cloudinary.uploader.destroy(
    "gba9qzz8xyzomquijswh",
    {
      resource_type: "image",
    }
  );
  console.log(deletedImage);
  return;

  const uploadedImageResult = await cloudinary.uploader.upload(
    "./uploads/file-1765373009397-3394.jpeg"
  );

  console.log({ uploadedImageResult });
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
  console.log({ optimizedImageUrl });
  return;

  const url = cloudinary.url("main-sample");
  console.log(url);

  // return;

  const uploadedImageUrl = url;
  const sampleImageUrl =
    "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg";

  // Upload an image
  const uploadResult = await cloudinary.uploader
    .upload(uploadedImageUrl, {
      public_id: "shoes1",
    })
    .catch((error) => {
      console.log(error);
    });

  console.log({ uploadResult });

  // Optimize delivery by resizing and applying auto-format and auto-quality
  const optimizeUrl = cloudinary.url("shoes1", {
    fetch_format: "auto",
    quality: "auto",
  });

  console.log(optimizeUrl);

  // Transform the image: auto-crop to square aspect_ratio
  const autoCropUrl = cloudinary.url("shoes1", {
    crop: "auto",
    gravity: "auto",
    width: 500,
    height: 500,
  });

  console.log(autoCropUrl);
})();
