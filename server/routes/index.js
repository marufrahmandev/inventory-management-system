const express = require("express");
const router = express.Router();
const config = require("../config/env.config");

const authRoutes = require("./auth.routes");
const customerRoutes = require("./customer.routes");
const supplierRoutes = require("./supplier.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const salesOrderRoutes = require("./salesOrder.routes");
const purchaseOrderRoutes = require("./purchaseOrder.routes");
const invoiceRoutes = require("./invoice.routes");
const stockRoutes = require("./stock.routes");
const reportRoutes = require("./report.routes");

const apiVersion = `/api/${config.server.apiVersion}`;

// Health check
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Management System API",
    version: config.server.apiVersion,
    status: "running",
  });
});

// API routes
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/customers`, customerRoutes);
router.use(`${apiVersion}/suppliers`, supplierRoutes);
router.use(`${apiVersion}/categories`, categoryRoutes);
router.use(`${apiVersion}/products`, productRoutes);
router.use(`${apiVersion}/sales-orders`, salesOrderRoutes);
router.use(`${apiVersion}/purchase-orders`, purchaseOrderRoutes);
router.use(`${apiVersion}/invoices`, invoiceRoutes);
router.use(`${apiVersion}/stocks`, stockRoutes);
router.use(`${apiVersion}/reports`, reportRoutes);

// Backward compatibility (deprecated)
router.use("/api/auth", authRoutes);
router.use("/api/customers", customerRoutes);
router.use("/api/suppliers", supplierRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/products", productRoutes);
router.use("/api/sales-orders", salesOrderRoutes);
router.use("/api/purchase-orders", purchaseOrderRoutes);
router.use("/api/invoices", invoiceRoutes);
router.use("/api/stocks", stockRoutes);
router.use("/api/reports", reportRoutes);

module.exports = router;

