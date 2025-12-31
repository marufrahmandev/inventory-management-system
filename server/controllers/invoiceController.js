const invoiceModel = require("../models/invoiceModel");
const salesOrderModel = require("../models/salesOrderModel");
const productModel = require("../models/productModel");

class InvoiceController {
  async getAll(req, res) {
    try {
      const { status, startDate, endDate } = req.query;

      let invoices = await invoiceModel.getAll();

      // Filter by status if provided
      if (status) {
        invoices = invoices.filter((invoice) => invoice.status === status);
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        invoices = invoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.invoiceDate);
          return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
        });
      }

      return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({
        message: "Error fetching invoices",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceModel.getById(id);

      if (!invoice || !invoice.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({
        message: "Error fetching invoice",
        error: error.message,
      });
    }
  }

  async getBySalesOrderId(req, res) {
    try {
      const { salesOrderId } = req.params;
      const invoices = await invoiceModel.getBySalesOrderId(salesOrderId);

      return res.status(200).json(invoices);
    } catch (error) {
      console.error("Error fetching invoices by sales order:", error);
      return res.status(500).json({
        message: "Error fetching invoices by sales order",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        invoiceNumber,
        salesOrderId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        tax,
        discount,
        total,
        paidAmount,
        status,
        paymentMethod,
        notes,
      } = req.body;

      // Validate required fields
      if (!invoiceNumber || !customerName || !items || items.length === 0) {
        return res.status(400).json({
          message: "Invoice number, customer name, and items are required",
        });
      }

      // Verify sales order exists if provided
      if (salesOrderId) {
        const salesOrder = await salesOrderModel.getById(salesOrderId);
        if (!salesOrder || !salesOrder.id) {
          return res.status(400).json({ message: "Invalid sales order ID" });
        }
      }

      // Enrich items with product information
      const enrichedItems = [];
      for (const item of items) {
        const product = await productModel.getById(item.productId);
        if (!product || !product.id) {
          return res.status(400).json({
            message: `Product with ID ${item.productId} not found`,
          });
        }

        // Enrich item with product name and calculate total
        enrichedItems.push({
          productId: item.productId,
          productName: item.productName || product.name,
          quantity: item.quantity,
          price: item.price || product.price,
          total: (item.price || product.price) * item.quantity,
        });
      }

      // Calculate totals if not provided
      const calculatedSubtotal = enrichedItems.reduce((sum, item) => sum + item.total, 0);
      const calculatedTotal = calculatedSubtotal + (parseFloat(tax) || 0) - (parseFloat(discount) || 0);

      const invoiceData = {
        invoiceNumber,
        salesOrderId: salesOrderId || null,
        customerName,
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        customerAddress: customerAddress || "",
        invoiceDate: invoiceDate || new Date().toISOString(),
        dueDate: dueDate || null,
        items: enrichedItems,
        subtotal: parseFloat(subtotal) || calculatedSubtotal,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || calculatedTotal,
        paidAmount: parseFloat(paidAmount) || 0,
        status: status || "unpaid",
        paymentMethod: paymentMethod || "",
        notes: notes || "",
      };

      const newInvoice = await invoiceModel.create(invoiceData);
      return res.status(201).json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      return res.status(500).json({
        message: "Error creating invoice",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        invoiceNumber,
        salesOrderId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        tax,
        discount,
        total,
        paidAmount,
        status,
        paymentMethod,
        notes,
      } = req.body;

      // Verify sales order exists if provided
      if (salesOrderId) {
        const salesOrder = await salesOrderModel.getById(salesOrderId);
        if (!salesOrder || !salesOrder.id) {
          return res.status(400).json({ message: "Invalid sales order ID" });
        }
      }

      const invoiceData = {
        invoiceNumber,
        salesOrderId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        invoiceDate,
        dueDate,
        items,
        subtotal: subtotal ? parseFloat(subtotal) : undefined,
        tax: tax ? parseFloat(tax) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        total: total ? parseFloat(total) : undefined,
        paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : undefined,
        status,
        paymentMethod,
        notes,
      };

      // Remove undefined values
      Object.keys(invoiceData).forEach(
        (key) => invoiceData[key] === undefined && delete invoiceData[key]
      );

      const updatedInvoice = await invoiceModel.update(id, invoiceData);

      if (!updatedInvoice || !updatedInvoice.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      return res.status(200).json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      return res.status(500).json({
        message: "Error updating invoice",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedInvoice = await invoiceModel.delete(id);

      if (!deletedInvoice || !deletedInvoice.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      return res.status(200).json(deletedInvoice);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return res.status(500).json({
        message: "Error deleting invoice",
        error: error.message,
      });
    }
  }
}

module.exports = new InvoiceController();

