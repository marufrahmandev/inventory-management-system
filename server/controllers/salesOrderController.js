const salesOrderModel = require("../models/salesOrderModel");
const productModel = require("../models/productModel");

class SalesOrderController {
  async getAll(req, res) {
    try {
      const { status, startDate, endDate } = req.query;

      let salesOrders = await salesOrderModel.getAll();

      // Filter by status if provided
      if (status) {
        salesOrders = salesOrders.filter((order) => order.status === status);
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        salesOrders = salesOrders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
      }

      return res.status(200).json({ success: true, data: salesOrders });
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      return res.status(500).json({
        message: "Error fetching sales orders",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const salesOrder = await salesOrderModel.getById(id);

      if (!salesOrder || !salesOrder.id) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      return res.status(200).json({ success: true, data: salesOrder });
    } catch (error) {
      console.error("Error fetching sales order:", error);
      return res.status(500).json({
        message: "Error fetching sales order",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        orderDate,
        deliveryDate,
        items,
        subtotal,
        tax,
        discount,
        total,
        status,
        notes,
      } = req.body;

      // Validate required fields
      if (!orderNumber || !customerName || !items || items.length === 0) {
        return res.status(400).json({
          message: "Order number, customer name, and items are required",
        });
      }

      // Validate products exist and enrich items with product names
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
          productName: product.name,
          quantity: item.quantity,
          price: item.unit_price || item.price || product.price,
          total: (item.unit_price || item.price || product.price) * item.quantity,
        });
      }

      // Calculate totals if not provided
      const calculatedSubtotal = enrichedItems.reduce((sum, item) => sum + item.total, 0);
      const calculatedTotal = calculatedSubtotal + (parseFloat(tax) || 0) - (parseFloat(discount) || 0);

      const salesOrderData = {
        orderNumber,
        customerId: req.body.customerId || null,
        customerName,
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        customerAddress: customerAddress || "",
        orderDate: orderDate || new Date().toISOString(),
        deliveryDate: deliveryDate || null,
        items: enrichedItems,
        subtotal: parseFloat(subtotal) || calculatedSubtotal,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || calculatedTotal,
        status: status || "pending",
        notes: notes || "",
      };

      const newSalesOrder = await salesOrderModel.create(salesOrderData);

      // Update product stock if order is confirmed
      if (status === "confirmed" || status === "completed") {
        for (const item of enrichedItems) {
          await productModel.updateStock(item.productId, -item.quantity);
        }
      }

      const orderData = newSalesOrder.toJSON ? newSalesOrder.toJSON() : newSalesOrder;
      return res.status(201).json({ success: true, data: orderData });
    } catch (error) {
      console.error("Error creating sales order:", error);
      return res.status(500).json({
        message: "Error creating sales order",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingSalesOrder = await salesOrderModel.getById(id);

      if (!existingSalesOrder || !existingSalesOrder.id) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      const {
        orderNumber,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        orderDate,
        deliveryDate,
        items,
        subtotal,
        tax,
        discount,
        total,
        status,
        notes,
      } = req.body;

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

      const salesOrderData = {
        orderNumber,
        // Always allow customerId to be updated; treat empty string as null
        customerId: customerId === "" ? null : (customerId ?? null),
        customerName,
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        customerAddress: customerAddress || "",
        orderDate,
        deliveryDate: deliveryDate || null,
        items: enrichedItems,
        status,
        notes: notes || "",
      };

      // Numeric fields: update based on presence (so 0 works correctly)
      if ("subtotal" in req.body) salesOrderData.subtotal = Number(subtotal) || 0;
      if ("tax" in req.body) salesOrderData.tax = Number(tax) || 0;
      if ("discount" in req.body) salesOrderData.discount = Number(discount) || 0;
      if ("total" in req.body) salesOrderData.total = Number(total) || 0;

      // Remove undefined values (keep 0)
      Object.keys(salesOrderData).forEach((key) => {
        if (salesOrderData[key] === undefined) delete salesOrderData[key];
      });

      // Handle stock updates if status changes
      if (status && status !== existingSalesOrder.status) {
        if (status === "confirmed" || status === "completed") {
          // Deduct stock
          for (const item of existingSalesOrder.items) {
            await productModel.updateStock(item.productId, -item.quantity);
          }
        } else if (status === "cancelled" && (existingSalesOrder.status === "confirmed" || existingSalesOrder.status === "completed")) {
          // Restore stock
          for (const item of existingSalesOrder.items) {
            await productModel.updateStock(item.productId, item.quantity);
          }
        }
      }

      const updatedSalesOrder = await salesOrderModel.update(id, salesOrderData);
      const orderData = updatedSalesOrder.toJSON ? updatedSalesOrder.toJSON() : updatedSalesOrder;
      return res.status(200).json({ success: true, data: orderData });
    } catch (error) {
      console.error("Error updating sales order:", error);
      return res.status(500).json({
        message: "Error updating sales order",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const salesOrder = await salesOrderModel.getById(id);

      if (!salesOrder || !salesOrder.id) {
        return res.status(404).json({ message: "Sales order not found" });
      }

      // Restore stock if order was confirmed
      if (salesOrder.status === "confirmed" || salesOrder.status === "completed") {
        for (const item of salesOrder.items) {
          await productModel.updateStock(item.productId, item.quantity);
        }
      }

      const deletedSalesOrder = await salesOrderModel.delete(id);
      return res.status(200).json({ success: true, data: deletedSalesOrder });
    } catch (error) {
      console.error("Error deleting sales order:", error);
      return res.status(500).json({
        message: "Error deleting sales order",
        error: error.message,
      });
    }
  }
}

module.exports = new SalesOrderController();

