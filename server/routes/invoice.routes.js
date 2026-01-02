const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

router.get("/", invoiceController.getAll);
router.get("/next-number", invoiceController.getNextInvoiceNumber);
router.get("/sales-order/:salesOrderId", invoiceController.getBySalesOrderId);
router.post("/from-sales-order/:salesOrderId", invoiceController.createFromSalesOrder);
router.get("/:id", invoiceController.getById);
router.post("/", invoiceController.create);
router.put("/:id", invoiceController.update);
router.delete("/:id", invoiceController.delete);

module.exports = router;

