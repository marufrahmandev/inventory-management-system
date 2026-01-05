const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/dashboard", reportController.getDashboardSummary);
router.get("/sales", reportController.getSalesReport);
router.get("/purchases", reportController.getPurchaseReport);
router.get("/inventory", reportController.getInventoryReport);
router.get("/invoices", reportController.getInvoiceReport);

module.exports = router;

