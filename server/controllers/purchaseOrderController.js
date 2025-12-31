const purchaseOrderModel = require("../models/purchaseOrderModel");
const productModel = require("../models/productModel");

class PurchaseOrderController {
  async getAll(req, res) {
    try {
      const { status, startDate, endDate } = req.query;

      let purchaseOrders = await purchaseOrderModel.getAll();

      // Filter by status if provided
      if (status) {
        purchaseOrders = purchaseOrders.filter((order) => order.status === status);
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        purchaseOrders = purchaseOrders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
      }

      return res.status(200).json({ success: true, data: purchaseOrders });
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      return res.status(500).json({
        message: "Error fetching purchase orders",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrder = await purchaseOrderModel.getById(id);

      if (!purchaseOrder || !purchaseOrder.id) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      return res.status(200).json(purchaseOrder);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      return res.status(500).json({
        message: "Error fetching purchase order",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        orderNumber,
        supplierName,
        supplierEmail,
        supplierPhone,
        supplierAddress,
        orderDate,
        expectedDate,
        items,
        subtotal,
        tax,
        discount,
        total,
        status,
        notes,
      } = req.body;

      // Validate required fields
      if (!orderNumber || !supplierName || !items || items.length === 0) {
        return res.status(400).json({
          message: "Order number, supplier name, and items are required",
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
          price: item.unit_price || item.price || product.cost,
          total: (item.unit_price || item.price || product.cost) * item.quantity,
        });
      }

      // Calculate totals if not provided
      const calculatedSubtotal = enrichedItems.reduce((sum, item) => sum + item.total, 0);
      const calculatedTotal = calculatedSubtotal + (parseFloat(tax) || 0) - (parseFloat(discount) || 0);

      const purchaseOrderData = {
        orderNumber,
        supplierName,
        supplierEmail: supplierEmail || "",
        supplierPhone: supplierPhone || "",
        supplierAddress: supplierAddress || "",
        orderDate: orderDate || new Date().toISOString(),
        expectedDate: expectedDate || null,
        items: enrichedItems,
        subtotal: parseFloat(subtotal) || calculatedSubtotal,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || calculatedTotal,
        status: status || "pending",
        notes: notes || "",
      };

      const newPurchaseOrder = await purchaseOrderModel.create(purchaseOrderData);

      // Update product stock if order is received
      if (status === "received") {
        for (const item of enrichedItems) {
          await productModel.updateStock(item.productId, item.quantity);
        }
      }

      return res.status(201).json(newPurchaseOrder);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      return res.status(500).json({
        message: "Error creating purchase order",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingPurchaseOrder = await purchaseOrderModel.getById(id);

      if (!existingPurchaseOrder || !existingPurchaseOrder.id) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      const {
        orderNumber,
        supplierName,
        supplierEmail,
        supplierPhone,
        supplierAddress,
        orderDate,
        expectedDate,
        items,
        subtotal,
        tax,
        discount,
        total,
        status,
        notes,
      } = req.body;

      const purchaseOrderData = {
        orderNumber,
        supplierName,
        supplierEmail,
        supplierPhone,
        supplierAddress,
        orderDate,
        expectedDate,
        items,
        subtotal: subtotal ? parseFloat(subtotal) : undefined,
        tax: tax ? parseFloat(tax) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        total: total ? parseFloat(total) : undefined,
        status,
        notes,
      };

      // Remove undefined values
      Object.keys(purchaseOrderData).forEach(
        (key) => purchaseOrderData[key] === undefined && delete purchaseOrderData[key]
      );

      // Handle stock updates if status changes
      if (status && status !== existingPurchaseOrder.status) {
        if (status === "received") {
          // Add stock
          for (const item of existingPurchaseOrder.items) {
            productModel.updateStock(item.productId, item.quantity);
          }
        } else if (status === "cancelled" && existingPurchaseOrder.status === "received") {
          // Remove stock
          for (const item of existingPurchaseOrder.items) {
            productModel.updateStock(item.productId, -item.quantity);
          }
        }
      }

      const updatedPurchaseOrder = await purchaseOrderModel.update(id, purchaseOrderData);
      return res.status(200).json(updatedPurchaseOrder);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      return res.status(500).json({
        message: "Error updating purchase order",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrder = await purchaseOrderModel.getById(id);

      if (!purchaseOrder || !purchaseOrder.id) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      // Remove stock if order was received
      if (purchaseOrder.status === "received") {
        for (const item of purchaseOrder.items) {
          productModel.updateStock(item.productId, -item.quantity);
        }
      }

      const deletedPurchaseOrder = await purchaseOrderModel.delete(id);
      return res.status(200).json(deletedPurchaseOrder);
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      return res.status(500).json({
        message: "Error deleting purchase order",
        error: error.message,
      });
    }
  }
}

module.exports = new PurchaseOrderController();

