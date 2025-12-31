const productModel = require("../models/productModel");
const salesOrderModel = require("../models/salesOrderModel");
const purchaseOrderModel = require("../models/purchaseOrderModel");
const invoiceModel = require("../models/invoiceModel");
const stockModel = require("../models/stockModel");

class ReportController {
  /**
   * Get dashboard summary
   */
  async getDashboardSummary(req, res) {
    try {
      const products = await productModel.getAll();
      const salesOrders = await salesOrderModel.getAll();
      const purchaseOrders = await purchaseOrderModel.getAll();
      const invoices = await invoiceModel.getAll();
      const stocks = await stockModel.getAll();

      // Calculate totals
      const totalProducts = products.length;
      const totalSalesOrders = salesOrders.length;
      const totalPurchaseOrders = purchaseOrders.length;
      const totalInvoices = invoices.length;

      // Calculate revenue
      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      // Calculate pending revenue
      const pendingRevenue = invoices
        .filter((inv) => inv.status === "unpaid" || inv.status === "partial")
        .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);

      // Low stock products
      const lowStockProducts = products.filter(
        (product) => product.stock <= (product.minStock || 10)
      );

      // Pending orders
      const pendingSalesOrders = salesOrders.filter(
        (order) => order.status === "pending"
      );
      const pendingPurchaseOrders = purchaseOrders.filter(
        (order) => order.status === "pending"
      );

      const summary = {
        totalProducts,
        totalSalesOrders,
        totalPurchaseOrders,
        totalInvoices,
        totalRevenue,
        pendingRevenue,
        lowStockCount: lowStockProducts.length,
        pendingSalesOrdersCount: pendingSalesOrders.length,
        pendingPurchaseOrdersCount: pendingPurchaseOrders.length,
      };

      return res.status(200).json(summary);
    } catch (error) {
      console.error("Error generating dashboard summary:", error);
      return res.status(500).json({
        message: "Error generating dashboard summary",
        error: error.message,
      });
    }
  }

  /**
   * Get sales report
   */
  async getSalesReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let salesOrders = await salesOrderModel.getAll();

      // Filter by date range
      if (startDate && endDate) {
        salesOrders = salesOrders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
          );
        });
      }

      // Calculate totals
      const totalOrders = salesOrders.length;
      const totalRevenue = salesOrders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const completedOrders = salesOrders.filter(
        (order) => order.status === "completed"
      ).length;
      const cancelledOrders = salesOrders.filter(
        (order) => order.status === "cancelled"
      ).length;

      // Group by status
      const ordersByStatus = salesOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Top products
      const productSales = {};
      salesOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              productName: item.productName || "Unknown",
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.quantity * item.price;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const report = {
        totalOrders,
        totalRevenue,
        completedOrders,
        cancelledOrders,
        ordersByStatus,
        topProducts,
        salesOrders,
      };

      return res.status(200).json(report);
    } catch (error) {
      console.error("Error generating sales report:", error);
      return res.status(500).json({
        message: "Error generating sales report",
        error: error.message,
      });
    }
  }

  /**
   * Get purchase report
   */
  async getPurchaseReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let purchaseOrders = await purchaseOrderModel.getAll();

      // Filter by date range
      if (startDate && endDate) {
        purchaseOrders = purchaseOrders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
          );
        });
      }

      // Calculate totals
      const totalOrders = purchaseOrders.length;
      const totalExpense = purchaseOrders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const receivedOrders = purchaseOrders.filter(
        (order) => order.status === "received"
      ).length;
      const cancelledOrders = purchaseOrders.filter(
        (order) => order.status === "cancelled"
      ).length;

      // Group by status
      const ordersByStatus = purchaseOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Group by supplier
      const supplierPurchases = purchaseOrders.reduce((acc, order) => {
        if (!acc[order.supplierName]) {
          acc[order.supplierName] = {
            supplierName: order.supplierName,
            orderCount: 0,
            totalExpense: 0,
          };
        }
        acc[order.supplierName].orderCount += 1;
        acc[order.supplierName].totalExpense += order.total || 0;
        return acc;
      }, {});

      const topSuppliers = Object.values(supplierPurchases)
        .sort((a, b) => b.totalExpense - a.totalExpense)
        .slice(0, 10);

      const report = {
        totalOrders,
        totalExpense,
        receivedOrders,
        cancelledOrders,
        ordersByStatus,
        topSuppliers,
        purchaseOrders,
      };

      return res.status(200).json(report);
    } catch (error) {
      console.error("Error generating purchase report:", error);
      return res.status(500).json({
        message: "Error generating purchase report",
        error: error.message,
      });
    }
  }

  /**
   * Get inventory report
   */
  async getInventoryReport(req, res) {
    try {
      const products = await productModel.getAll();
      const stocks = await stockModel.getAll();

      // Calculate total inventory value
      const totalValue = products.reduce(
        (sum, product) => sum + (product.stock || 0) * (product.price || 0),
        0
      );

      // Low stock products
      const lowStockProducts = products
        .filter((product) => product.stock <= (product.minStock || 10))
        .map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          minStock: product.minStock,
        }));

      // Out of stock products
      const outOfStockProducts = products
        .filter((product) => product.stock === 0)
        .map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
        }));

      // Products by category
      const productsByCategory = products.reduce((acc, product) => {
        const categoryId = product.categoryId || "uncategorized";
        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            productCount: 0,
            totalStock: 0,
            totalValue: 0,
          };
        }
        acc[categoryId].productCount += 1;
        acc[categoryId].totalStock += product.stock || 0;
        acc[categoryId].totalValue +=
          (product.stock || 0) * (product.price || 0);
        return acc;
      }, {});

      const report = {
        totalProducts: products.length,
        totalStockQuantity: products.reduce(
          (sum, product) => sum + (product.stock || 0),
          0
        ),
        totalValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockProducts,
        outOfStockProducts,
        productsByCategory: Object.values(productsByCategory),
      };

      return res.status(200).json(report);
    } catch (error) {
      console.error("Error generating inventory report:", error);
      return res.status(500).json({
        message: "Error generating inventory report",
        error: error.message,
      });
    }
  }

  /**
   * Get invoice report
   */
  async getInvoiceReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let invoices = await invoiceModel.getAll();

      // Filter by date range
      if (startDate && endDate) {
        invoices = invoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.invoiceDate);
          return (
            invoiceDate >= new Date(startDate) &&
            invoiceDate <= new Date(endDate)
          );
        });
      }

      // Calculate totals
      const totalInvoices = invoices.length;
      const totalAmount = invoices.reduce(
        (sum, invoice) => sum + (invoice.total || 0),
        0
      );
      const paidAmount = invoices.reduce(
        (sum, invoice) => sum + (invoice.paidAmount || 0),
        0
      );
      const unpaidAmount = totalAmount - paidAmount;

      // Group by status
      const invoicesByStatus = invoices.reduce((acc, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + 1;
        return acc;
      }, {});

      // Overdue invoices
      const today = new Date();
      const overdueInvoices = invoices.filter((invoice) => {
        if (invoice.status === "paid") return false;
        if (!invoice.dueDate) return false;
        return new Date(invoice.dueDate) < today;
      });

      const report = {
        totalInvoices,
        totalAmount,
        paidAmount,
        unpaidAmount,
        overdueCount: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce(
          (sum, inv) => sum + (inv.total - (inv.paidAmount || 0)),
          0
        ),
        invoicesByStatus,
        overdueInvoices: overdueInvoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          total: inv.total,
          paidAmount: inv.paidAmount,
          dueDate: inv.dueDate,
        })),
      };

      return res.status(200).json(report);
    } catch (error) {
      console.error("Error generating invoice report:", error);
      return res.status(500).json({
        message: "Error generating invoice report",
        error: error.message,
      });
    }
  }
}

module.exports = new ReportController();

