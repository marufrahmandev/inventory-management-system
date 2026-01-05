const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const {
  uploadProductImageToCloudinary,
  uploadProductGalleryToCloudinary,
  deleteImageFromCloudinary,
  deleteMultipleImagesFromCloudinary,
} = require("../utils/cloudinaryHelper");

class ProductController {
  async getAll(req, res) {
    try {
      let products = await productModel.getAll();

      // Add product image URLs to response
      if (products.length > 0) {
        products = products.map((product) => {
          const productData = { ...product };
          
          // Add main product image URL from Cloudinary
          if (product.product_image_secureUrl || product.product_image_optimizedUrl) {
            productData.product_image_url = product.product_image_secureUrl || product.product_image_optimizedUrl;
          }
          
          // Parse gallery if it's a string
          if (product.product_gallery) {
            try {
              productData.product_gallery = typeof product.product_gallery === 'string' 
                ? JSON.parse(product.product_gallery) 
                : product.product_gallery;
            } catch (e) {
              productData.product_gallery = [];
            }
          } else {
            productData.product_gallery = [];
          }
          
          return productData;
        });
      }

      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({
        message: "Error fetching products",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getById(id);

      if (!product || !product.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Add product image URL from Cloudinary
      if (product.product_image_secureUrl || product.product_image_optimizedUrl) {
        product.product_image_url = product.product_image_secureUrl || product.product_image_optimizedUrl;
      }

      // Parse gallery if it's a string
      if (product.product_gallery) {
        try {
          product.product_gallery = typeof product.product_gallery === 'string'
            ? JSON.parse(product.product_gallery)
            : product.product_gallery;
        } catch (e) {
          product.product_gallery = [];
        }
      } else {
        product.product_gallery = [];
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({
        message: "Error fetching product",
        error: error.message,
      });
    }
  }

  async getByCategoryId(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await productModel.getByCategoryId(categoryId);

      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return res.status(500).json({
        message: "Error fetching products by category",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        name,
        categoryId,
        sku,
        description,
        price,
        cost,
        stock,
        minStock,
        unit,
        barcode,
      } = req.body;

      // Validate required fields
      if (!name || !categoryId) {
        return res.status(400).json({
          message: "Name and categoryId are required",
        });
      }

      // Validate product image is required
      if (!req.files || !req.files.product_image || req.files.product_image.length === 0) {
        return res.status(400).json({
          message: "Product image is required",
        });
      }

      // Verify category exists
      const category = await categoryModel.getById(categoryId);
      if (!category || !category.id) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const productData = {
        name,
        categoryId,
        sku: sku || "",
        description: description || "",
        price: parseFloat(price) || 0,
        cost: parseFloat(cost) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        unit: unit || "pcs",
        barcode: barcode || "",
        product_image: req.files.product_image[0].filename,
      };

      const newProduct = await productModel.create(productData);

      // Upload main product image to Cloudinary
      if (req.files.product_image && req.files.product_image.length > 0) {
        const mainImageData = await uploadProductImageToCloudinary(
          req.files.product_image[0].filename
        );
        if (mainImageData) {
          await productModel.update(newProduct.id, {
            product_image_optimizedUrl: mainImageData.optimizedUrl,
            product_image_secureUrl: mainImageData.secureUrl,
            product_image_publicId: mainImageData.publicId,
            product_image_url: mainImageData.url,
          });
        }
      }

      // Upload gallery images to Cloudinary (if any)
      if (req.files.product_gallery && req.files.product_gallery.length > 0) {
        const galleryFilenames = req.files.product_gallery.map((file) => file.filename);
        const galleryImages = await uploadProductGalleryToCloudinary(galleryFilenames);
        if (galleryImages.length > 0) {
          await productModel.update(newProduct.id, {
            product_gallery: galleryImages,
          });
        }
      }

      // Fetch updated product with image data
      const updatedProduct = await productModel.getById(newProduct.id);
      return res.status(201).json(updatedProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({
        message: "Error creating product",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        categoryId,
        sku,
        description,
        price,
        cost,
        stock,
        minStock,
        unit,
        barcode,
        product_image, // Existing image filename
      } = req.body;

      // Get existing product to check for old images
      const existingProduct = await productModel.getById(id);
      if (!existingProduct || !existingProduct.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Verify category exists if provided
      if (categoryId) {
        const category = await categoryModel.getById(categoryId);
        if (!category || !category.id) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
      }

      const productData = {
        name,
        categoryId,
        sku,
        description,
        price: price ? parseFloat(price) : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        unit,
        barcode,
      };

      // Handle main product image update
      if (req.files && req.files.product_image && req.files.product_image.length > 0) {
        // New image uploaded
        productData.product_image = req.files.product_image[0].filename;

        // Delete old image from Cloudinary if exists
        if (existingProduct.product_image_publicId) {
          await deleteImageFromCloudinary(existingProduct.product_image_publicId);
        }

        // Upload new image to Cloudinary
        const mainImageData = await uploadProductImageToCloudinary(
          req.files.product_image[0].filename
        );
        if (mainImageData) {
          productData.product_image_optimizedUrl = mainImageData.optimizedUrl;
          productData.product_image_secureUrl = mainImageData.secureUrl;
          productData.product_image_publicId = mainImageData.publicId;
          productData.product_image_url = mainImageData.url;
        }
      } else if (product_image) {
        // Keep existing image
        productData.product_image = product_image;
      }

      // Handle gallery images update
      if (req.files && req.files.product_gallery && req.files.product_gallery.length > 0) {
        // New gallery images uploaded
        const galleryFilenames = req.files.product_gallery.map((file) => file.filename);
        const galleryImages = await uploadProductGalleryToCloudinary(galleryFilenames);

        // Get existing gallery images
        let existingGallery = [];
        if (existingProduct.product_gallery) {
          try {
            existingGallery = typeof existingProduct.product_gallery === 'string'
              ? JSON.parse(existingProduct.product_gallery)
              : existingProduct.product_gallery;
          } catch (e) {
            existingGallery = [];
          }
        }

        // Merge existing and new gallery images
        const mergedGallery = [...existingGallery, ...galleryImages];
        productData.product_gallery = mergedGallery;
      }

      // Remove undefined values
      Object.keys(productData).forEach(
        (key) => productData[key] === undefined && delete productData[key]
      );

      const updatedProduct = await productModel.update(id, productData);

      if (!updatedProduct || !updatedProduct.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Fetch updated product with all data
      const finalProduct = await productModel.getById(id);
      return res.status(200).json(finalProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        message: "Error updating product",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Get product before deleting to access image publicIds
      const product = await productModel.getById(id);
      if (!product || !product.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete main image from Cloudinary
      if (product.product_image_publicId) {
        await deleteImageFromCloudinary(product.product_image_publicId);
      }

      // Delete gallery images from Cloudinary
      if (product.product_gallery) {
        try {
          const gallery = typeof product.product_gallery === 'string'
            ? JSON.parse(product.product_gallery)
            : product.product_gallery;
          
          if (Array.isArray(gallery) && gallery.length > 0) {
            const publicIds = gallery
              .map((img) => img.publicId)
              .filter((id) => id);
            if (publicIds.length > 0) {
              await deleteMultipleImagesFromCloudinary(publicIds);
            }
          }
        } catch (e) {
          console.error("Error parsing gallery for deletion:", e);
        }
      }

      const deletedProduct = await productModel.delete(id);

      if (!deletedProduct || !deletedProduct.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(deletedProduct);
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({
        message: "Error deleting product",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();

