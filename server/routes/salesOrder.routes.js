const express = require("express");
const router = express.Router();
const salesOrderController = require("../controllers/salesOrderController");

router.get("/", salesOrderController.getAll);
router.get("/next-number", salesOrderController.getNextOrderNumber);
router.get("/:id", salesOrderController.getById);
router.post("/", salesOrderController.create);
router.put("/:id", salesOrderController.update);
router.delete("/:id", salesOrderController.delete);

module.exports = router;

