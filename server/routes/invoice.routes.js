const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

router.get("/", invoiceController.getAll);
router.get("/:id", invoiceController.getById);
router.get("/sales-order/:salesOrderId", invoiceController.getBySalesOrderId);
router.post("/", invoiceController.create);
router.put("/:id", invoiceController.update);
router.delete("/:id", invoiceController.delete);

module.exports = router;

