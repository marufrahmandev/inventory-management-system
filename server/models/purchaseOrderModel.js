const { PurchaseOrder, PurchaseOrderItem, Product, Supplier } = require("./index");
const database = require("../config/database");
const { Op } = require("sequelize");

/**
 * Purchase Order Model using Sequelize ORM
 * Handles purchase orders with transactions for data integrity
 */
class PurchaseOrderModel {
  /**
   * Get all purchase orders with items
   */
  async getAll() {
    try {
      const orders = await PurchaseOrder.findAll({
        include: [
          {
            model: Supplier,
            attributes: ["id", "name", "email", "phone"],
            required: false,
          },
          {
            model: PurchaseOrderItem,
            as: "items",
            include: [{
              model: Product,
              attributes: ["id", "name", "sku"],
            }],
          },
        ],
        order: [["orderDate", "DESC"]],
      });
      
      return orders.map(order => {
        const data = order.toJSON();
        return {
          ...data,
          supplier: data.Supplier || null, // Expose the linked supplier separately
          items: data.items || [],
          Supplier: undefined, // Remove nested Supplier object
        };
      });
    } catch (error) {
      console.error("Error getting all purchase orders:", error);
      return [];
    }
  }

  /**
   * Get purchase order by ID with items
   */
  async getById(id) {
    try {
      const order = await PurchaseOrder.findByPk(id, {
        include: [
          {
            model: Supplier,
            attributes: ["id", "name", "email", "phone", "address"],
            required: false,
          },
          {
            model: PurchaseOrderItem,
            as: "items",
            include: [{
              model: Product,
              attributes: ["id", "name", "sku"],
            }],
          },
        ],
      });
      
      if (!order) {
        return null;
      }
      
      const data = order.toJSON();
      return {
        ...data,
        supplier: data.Supplier || null, // Expose the linked supplier separately
        items: data.items || [],
        Supplier: undefined, // Remove nested Supplier object
      };
    } catch (error) {
      console.error("Error getting purchase order by ID:", error);
      return null;
    }
  }

  /**
   * Create new purchase order with items (transactional)
   */
  async create(purchaseOrderData) {
    return await database.transaction(async (t) => {
      try {
        const { items, ...orderData } = purchaseOrderData;
        
        const order = await PurchaseOrder.create(orderData, { transaction: t });
        
        if (items && items.length > 0) {
          const orderItems = items.map(item => ({
            ...item,
            purchaseOrderId: order.id,
          }));
          
          await PurchaseOrderItem.bulkCreate(orderItems, { transaction: t });
        }
        
        const completeOrder = await PurchaseOrder.findByPk(order.id, {
          include: [{ model: PurchaseOrderItem, as: "items" }],
          transaction: t,
        });
        
        return completeOrder;
      } catch (error) {
        console.error("Error creating purchase order:", error);
        throw error;
      }
    });
  }

  /**
   * Update purchase order with items (transactional)
   */
  async update(id, purchaseOrderData) {
    return await database.transaction(async (t) => {
      try {
        const { items, ...orderData } = purchaseOrderData;
        
        const order = await PurchaseOrder.findByPk(id, { transaction: t });
        
        if (!order) {
          throw new Error("Purchase order not found");
        }
        
        await order.update(orderData, { transaction: t });
        
        if (items) {
          await PurchaseOrderItem.destroy({
            where: { purchaseOrderId: id },
            transaction: t,
          });
          
          if (items.length > 0) {
            const orderItems = items.map(item => ({
              ...item,
              purchaseOrderId: id,
            }));
            
            await PurchaseOrderItem.bulkCreate(orderItems, { transaction: t });
          }
        }
        
        const completeOrder = await PurchaseOrder.findByPk(id, {
          include: [{ model: PurchaseOrderItem, as: "items" }],
          transaction: t,
        });
        
        return completeOrder;
      } catch (error) {
        console.error("Error updating purchase order:", error);
        throw error;
      }
    });
  }

  /**
   * Delete purchase order
   */
  async delete(id) {
    try {
      const order = await PurchaseOrder.findByPk(id, {
        include: [{ model: PurchaseOrderItem, as: "items" }],
      });
      
      if (!order) {
        return { success: false, message: "Purchase order not found" };
      }
      
      const orderData = order.toJSON();
      await order.destroy();
      
      return orderData;
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      return { success: false, message: "Error deleting purchase order" };
    }
  }

  /**
   * Get orders by date range
   */
  async getByDateRange(startDate, endDate) {
    try {
      return await PurchaseOrder.findAll({
        where: {
          orderDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [{ model: PurchaseOrderItem, as: "items" }],
        order: [["orderDate", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting orders by date range:", error);
      return [];
    }
  }

  /**
   * Get orders by status
   */
  async getByStatus(status) {
    try {
      return await PurchaseOrder.findAll({
        where: { status },
        include: [{ model: PurchaseOrderItem, as: "items" }],
        order: [["orderDate", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting orders by status:", error);
      return [];
    }
  }
}

module.exports = new PurchaseOrderModel();
