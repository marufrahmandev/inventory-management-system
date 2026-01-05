const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { storeProductFiles } = require("../utils/fileUpload");

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.get("/category/:categoryId", productController.getByCategoryId);

router.post("/", async (req, res, next) => {
  await storeProductFiles(req, res, next);
  productController.create(req, res);
});

router.put("/:id", async (req, res, next) => {
  await storeProductFiles(req, res, next);
  productController.update(req, res);
});

router.delete("/:id", productController.delete);

module.exports = router;

