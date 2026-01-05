const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/", stockController.getAll);
router.get("/low-stock", stockController.getLowStock);
router.get("/:id", stockController.getById);
router.get("/product/:productId", stockController.getByProductId);
router.post("/", stockController.create);
router.put("/:id", stockController.update);
router.delete("/:id", stockController.delete);

module.exports = router;

