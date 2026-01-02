-- Migration: Add Product Image Fields
-- Run this script to add image fields to existing products table

ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_image VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS product_image_optimizedUrl VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS product_image_secureUrl VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS product_image_publicId VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS product_image_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS product_gallery TEXT NULL;

-- Note: product_gallery stores JSON array of gallery images
-- Format: [{"url": "...", "publicId": "...", "optimizedUrl": "...", "secureUrl": "..."}, ...]

