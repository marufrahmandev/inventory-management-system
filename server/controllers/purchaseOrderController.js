const purchaseOrderModel = require("../models/purchaseOrderModel");
const productModel = require("../models/productModel");
const supplierModel = require("../models/supplierModel");

// Helper function to sync supplier master data from purchase order form
const syncSupplierFromOrderBody = async (req, res) => {
  const { supplierId, supplierName, supplierEmail, supplierPhone, supplierAddress } = req.body;

  if (supplierId) {
    try {
      const updateData = {};
      if ("supplierName" in req.body) updateData.name = supplierName || null;
      if ("supplierEmail" in req.body) updateData.email = supplierEmail || null;
      if ("supplierPhone" in req.body) updateData.phone = supplierPhone || null;
      if ("supplierAddress" in req.body) updateData.address = supplierAddress || null;

      if (Object.keys(updateData).length > 0) {
        await supplierModel.update(supplierId, updateData);
      }
    } catch (error) {
      console.error("Error syncing supplier master data:", error);
      res.status(500).json({
        message: "Error syncing supplier master data",
        error: error.message,
      });
      return false;
    }
  }
  return true;
};

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

      return res.status(200).json({ success: true, data: purchaseOrder });
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
        supplierId,
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

      // Sync supplier master record from purchase order form (if supplierId present)
      const ok = await syncSupplierFromOrderBody(req, res);
      if (!ok) return;

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
        supplierId: supplierId || null,
        supplierName: supplierName || "",
        supplierEmail: supplierEmail || "",
        supplierPhone: supplierPhone || "",
        supplierAddress: supplierAddress || "",
        orderDate: orderDate || new Date().toISOString(),
        expectedDate: expectedDate || null,
        items: enrichedItems,
        status: status || "pending",
        notes: notes || "",
      };

      // Numeric fields: update based on presence (so 0 works correctly)
      if ("subtotal" in req.body) purchaseOrderData.subtotal = Number(subtotal) || 0;
      else purchaseOrderData.subtotal = calculatedSubtotal;
      
      if ("tax" in req.body) purchaseOrderData.tax = Number(tax) || 0;
      if ("discount" in req.body) purchaseOrderData.discount = Number(discount) || 0;
      
      if ("total" in req.body) purchaseOrderData.total = Number(total) || 0;
      else purchaseOrderData.total = calculatedTotal;

      const newPurchaseOrder = await purchaseOrderModel.create(purchaseOrderData);

      // Update product stock if order is received
      if (status === "received") {
        for (const item of enrichedItems) {
          await productModel.updateStock(item.productId, item.quantity);
        }
      }

      const orderData = newPurchaseOrder.toJSON ? newPurchaseOrder.toJSON() : newPurchaseOrder;
      return res.status(201).json({ success: true, data: orderData });
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

      // Sync supplier master record from purchase order form (if supplierId present)
      const ok = await syncSupplierFromOrderBody(req, res);
      if (!ok) return;

      const {
        orderNumber,
        supplierId,
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

      const purchaseOrderData = {
        orderNumber,
        supplierId: supplierId === "" ? null : (supplierId ?? null),
        supplierName: supplierName || "",
        supplierEmail: supplierEmail || "",
        supplierPhone: supplierPhone || "",
        supplierAddress: supplierAddress || "",
        orderDate,
        expectedDate: expectedDate || null,
        items: enrichedItems,
        status,
        notes: notes || "",
      };

      // Numeric fields: update based on presence (so 0 works correctly)
      if ("subtotal" in req.body) purchaseOrderData.subtotal = Number(subtotal) || 0;
      if ("tax" in req.body) purchaseOrderData.tax = Number(tax) || 0;
      if ("discount" in req.body) purchaseOrderData.discount = Number(discount) || 0;
      if ("total" in req.body) purchaseOrderData.total = Number(total) || 0;

      // Handle stock updates if status changes
      if (status && status !== existingPurchaseOrder.status) {
        if (status === "received") {
          // Add stock
          for (const item of existingPurchaseOrder.items) {
            await productModel.updateStock(item.productId, item.quantity);
          }
        } else if (status === "cancelled" && existingPurchaseOrder.status === "received") {
          // Remove stock
          for (const item of existingPurchaseOrder.items) {
            await productModel.updateStock(item.productId, -item.quantity);
          }
        }
      }

      const updatedPurchaseOrder = await purchaseOrderModel.update(id, purchaseOrderData);
      const orderData = updatedPurchaseOrder.toJSON ? updatedPurchaseOrder.toJSON() : updatedPurchaseOrder;
      return res.status(200).json({ success: true, data: orderData });
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

