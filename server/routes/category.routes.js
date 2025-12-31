const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { storeSingleFile } = require("../utils/fileUpload");

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

router.post("/", async (req, res, next) => {
  await storeSingleFile(req, res, next);
  categoryController.create(req, res);
});

router.put("/:id", async (req, res, next) => {
  await storeSingleFile(req, res, next);
  categoryController.update(req, res);
});

router.delete("/:id", categoryController.delete);

module.exports = router;

