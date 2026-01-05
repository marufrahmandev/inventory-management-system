const invoiceModel = require("../models/invoiceModel");
const salesOrderModel = require("../models/salesOrderModel");
const productModel = require("../models/productModel");
const customerModel = require("../models/customerModel");

class InvoiceController {
  // Generate next invoice number
  async getNextInvoiceNumber(req, res) {
    try {
      const invoiceNumber = await invoiceModel.getNextInvoiceNumber();
      return res.status(200).json({ success: true, data: { invoiceNumber } });
    } catch (error) {
      console.error("Error generating next invoice number:", error);
      return res.status(500).json({
        message: "Error generating next invoice number",
        error: error.message,
      });
    }
  }

  // Generate invoice from sales order
  async createFromSalesOrder(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { invoiceDate, dueDate, notes } = req.body;

      // Get the sales order
      const salesOrder = await salesOrderModel.getById(salesOrderId);
      if (!salesOrder || !salesOrder.id) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Check if sales order is in a valid state for invoicing
      if (salesOrder.status !== "confirmed" && salesOrder.status !== "completed") {
        return res.status(400).json({
          message: "Sales order must be confirmed or completed before generating an invoice",
        });
      }

      // Check if invoice already exists for this sales order
      const existingInvoices = await invoiceModel.getBySalesOrderId(salesOrderId);
      if (existingInvoices && existingInvoices.length > 0) {
        return res.status(400).json({
          message: "Invoice already exists for this sales order",
          existingInvoice: existingInvoices[0],
        });
      }

      // Generate invoice number
      const invoiceNumber = await invoiceModel.getNextInvoiceNumber();

      // Create invoice from sales order data
      const invoiceData = {
        invoiceNumber,
        salesOrderId: salesOrder.id,
        customerId: salesOrder.customerId || null,
        customerName: salesOrder.customerName,
        customerEmail: salesOrder.customerEmail || "",
        customerPhone: salesOrder.customerPhone || "",
        customerAddress: salesOrder.customerAddress || "",
        invoiceDate: invoiceDate || new Date().toISOString(),
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        items: salesOrder.items || [],
        subtotal: salesOrder.subtotal || 0,
        tax: salesOrder.tax || 0,
        discount: salesOrder.discount || 0,
        total: salesOrder.total || 0,
        paidAmount: salesOrder.total || 0, // Default to total amount (paid in full)
        status: "paid", // Mark as paid since amount equals total
        paymentMethod: "",
        notes: notes || `Generated from Sales Order ${salesOrder.orderNumber}`,
      };

      const newInvoice = await invoiceModel.create(invoiceData);
      const invoiceDataPlain = newInvoice.toJSON ? newInvoice.toJSON() : newInvoice;
      return res.status(201).json({ success: true, data: invoiceDataPlain });
    } catch (error) {
      console.error("Error generating invoice from sales order:", error);
      return res.status(500).json({
        message: "Error generating invoice from sales order",
        error: error.message,
      });
    }
  }
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

      return res.status(200).json({ success: true, data: invoice });
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

      return res.status(200).json({ success: true, data: invoices });
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
      let {
        invoiceNumber,
        salesOrderId,
        customerId,
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

      // Auto-create customer if no customerId but customer details provided
      if ((!customerId || String(customerId).trim() === "") && customerName && String(customerName).trim() !== "") {
        try {
          const newCustomer = await customerModel.create({
            name: customerName,
            email: customerEmail || null,
            phone: customerPhone || null,
            address: customerAddress || null,
            status: "active",
          });
          customerId = newCustomer.id;
          console.log(`Auto-created customer: ${newCustomer.id} - ${newCustomer.name}`);
        } catch (error) {
          console.error("Error auto-creating customer:", error);
        }
      }

      // Load current customer data if customerId is provided
      let customerSnapshot = null;
      if (customerId && String(customerId).trim() !== "") {
        const customer = await customerModel.getById(customerId);
        if (customer && customer.id) {
          customerSnapshot = {
            customerName: customer.name || "",
            customerEmail: customer.email || "",
            customerPhone: customer.phone || "",
            customerAddress: customer.address || "",
          };
        }
      } else {
        customerSnapshot = {
          customerName: customerName || "",
          customerEmail: customerEmail || "",
          customerPhone: customerPhone || "",
          customerAddress: customerAddress || "",
        };
      }

      // Verify sales order exists if provided
      if (salesOrderId && String(salesOrderId).trim() !== "") {
        const salesOrder = await salesOrderModel.getById(salesOrderId);
        if (!salesOrder || !salesOrder.id) {
          return res.status(400).json({ message: "Invalid sales order ID" });
        }
      }

      // Validate required fields
      if (!invoiceNumber || !customerSnapshot.customerName || !items || items.length === 0) {
        return res.status(400).json({
          message: "Invoice number, customer name, and items are required",
        });
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
        invoiceNumber: invoiceNumber || await invoiceModel.getNextInvoiceNumber(),
        salesOrderId: salesOrderId || null,
        customerId: customerId || null,
        ...customerSnapshot,
        invoiceDate: invoiceDate || new Date().toISOString(),
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        items: enrichedItems,
        status: status || "unpaid",
        paymentMethod: paymentMethod || "",
        notes: notes || "",
      };

      // Numeric fields
      if ("subtotal" in req.body) invoiceData.subtotal = Number(subtotal) || 0;
      else invoiceData.subtotal = calculatedSubtotal;
      
      if ("tax" in req.body) invoiceData.tax = Number(tax) || 0;
      if ("discount" in req.body) invoiceData.discount = Number(discount) || 0;
      if ("paidAmount" in req.body) invoiceData.paidAmount = Number(paidAmount) || 0;
      else invoiceData.paidAmount = 0;
      
      if ("total" in req.body) invoiceData.total = Number(total) || 0;
      else invoiceData.total = calculatedTotal;

      const newInvoice = await invoiceModel.create(invoiceData);
      const invoiceDataPlain = newInvoice.toJSON ? newInvoice.toJSON() : newInvoice;
      return res.status(201).json({ success: true, data: invoiceDataPlain });
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
      const existingInvoice = await invoiceModel.getById(id);

      if (!existingInvoice || !existingInvoice.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const {
        invoiceNumber,
        salesOrderId,
        customerId,
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

      // Load current customer data if customerId is provided
      let customerSnapshot = null;
      if (customerId && String(customerId).trim() !== "") {
        const customer = await customerModel.getById(customerId);
        if (customer && customer.id) {
          customerSnapshot = {
            customerName: customer.name || "",
            customerEmail: customer.email || "",
            customerPhone: customer.phone || "",
            customerAddress: customer.address || "",
          };
        } else {
          return res.status(400).json({ message: "Invalid customer ID" });
        }
      } else {
        customerSnapshot = {
          customerName: customerName || "",
          customerEmail: customerEmail || "",
          customerPhone: customerPhone || "",
          customerAddress: customerAddress || "",
        };
      }

      // Verify sales order exists if provided
      if (salesOrderId && String(salesOrderId).trim() !== "") {
        const salesOrder = await salesOrderModel.getById(salesOrderId);
        if (!salesOrder || !salesOrder.id) {
          return res.status(400).json({ message: "Invalid sales order ID" });
        }
      }

      // Enrich items with product names if items are provided
      let enrichedItems = items;
      if (items && items.length > 0) {
        enrichedItems = [];
        for (const item of items) {
          const product = await productModel.getById(item.productId);
          if (!product || !product.id) {
            return res.status(400).json({
              message: `Product with ID ${item.productId} not found`,
            });
          }
          enrichedItems.push({
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          });
        }
      }

      const invoiceData = {
        invoiceNumber,
        salesOrderId: salesOrderId === "" ? null : (salesOrderId ?? null),
        customerId: customerId === "" ? null : (customerId ?? null),
        ...customerSnapshot,
        invoiceDate,
        dueDate,
        items: enrichedItems,
        status,
        paymentMethod: paymentMethod || "",
        notes: notes || "",
      };

      // Numeric fields: update based on presence (so 0 works correctly)
      if ("subtotal" in req.body) invoiceData.subtotal = Number(subtotal) || 0;
      if ("tax" in req.body) invoiceData.tax = Number(tax) || 0;
      if ("discount" in req.body) invoiceData.discount = Number(discount) || 0;
      if ("total" in req.body) invoiceData.total = Number(total) || 0;
      if ("paidAmount" in req.body) invoiceData.paidAmount = Number(paidAmount) || 0;

      // Remove undefined values (keep 0)
      Object.keys(invoiceData).forEach((key) => {
        if (invoiceData[key] === undefined) delete invoiceData[key];
      });

      const updatedInvoice = await invoiceModel.update(id, invoiceData);
      const invoiceDataPlain = updatedInvoice.toJSON ? updatedInvoice.toJSON() : updatedInvoice;
      return res.status(200).json({ success: true, data: invoiceDataPlain });
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

