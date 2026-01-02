const purchaseOrderModel = require("../models/purchaseOrderModel");
const productModel = require("../models/productModel");
const supplierModel = require("../models/supplierModel");

// Load current supplier data from database to ensure consistency
// Returns supplier snapshot fields or null if no supplierId
async function loadSupplierSnapshot(supplierId) {
  if (!supplierId || String(supplierId).trim() === "") {
    return null;
  }

  try {
    const supplier = await supplierModel.getById(supplierId);
    if (!supplier || !supplier.id) {
      return null;
    }

    // Return the CURRENT supplier data from master record
    return {
      supplierName: supplier.name || "",
      supplierEmail: supplier.email || "",
      supplierPhone: supplier.phone || "",
      supplierAddress: supplier.address || "",
    };
  } catch (error) {
    console.error("Error loading supplier snapshot:", error);
    return null;
  }
}

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
      let {
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

      // Auto-create supplier if no supplierId but supplier details provided
      if ((!supplierId || String(supplierId).trim() === "") && supplierName && String(supplierName).trim() !== "") {
        try {
          const newSupplier = await supplierModel.create({
            name: supplierName,
            email: supplierEmail || null,
            phone: supplierPhone || null,
            address: supplierAddress || null,
            status: "active",
          });
          supplierId = newSupplier.id;
          console.log(`Auto-created supplier: ${newSupplier.id} - ${newSupplier.name}`);
        } catch (error) {
          console.error("Error auto-creating supplier:", error);
          // Continue without supplierId if creation fails
        }
      }

      // Load current supplier data if supplierId is provided
      let supplierSnapshot = null;
      if (supplierId && String(supplierId).trim() !== "") {
        supplierSnapshot = await loadSupplierSnapshot(supplierId);
        if (!supplierSnapshot) {
          return res.status(400).json({ message: "Invalid supplier ID" });
        }
      } else {
        // Use form data for guest suppliers (no supplierId)
        supplierSnapshot = {
          supplierName: supplierName || "",
          supplierEmail: supplierEmail || "",
          supplierPhone: supplierPhone || "",
          supplierAddress: supplierAddress || "",
        };
      }

      // Validate required fields
      if (!orderNumber || !supplierSnapshot.supplierName || !items || items.length === 0) {
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
        supplierId: supplierId || null,
        ...supplierSnapshot, // Use CURRENT supplier data from database or guest data from form
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

      // Load current supplier data if supplierId is provided
      let supplierSnapshot = null;
      if (supplierId && String(supplierId).trim() !== "") {
        supplierSnapshot = await loadSupplierSnapshot(supplierId);
        if (!supplierSnapshot) {
          return res.status(400).json({ message: "Invalid supplier ID" });
        }
      } else {
        // Use form data for guest suppliers (no supplierId)
        supplierSnapshot = {
          supplierName: supplierName || "",
          supplierEmail: supplierEmail || "",
          supplierPhone: supplierPhone || "",
          supplierAddress: supplierAddress || "",
        };
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

      const purchaseOrderData = {
        orderNumber,
        supplierId: supplierId === "" ? null : (supplierId ?? null),
        ...supplierSnapshot, // Use CURRENT supplier data from database or guest data from form
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

