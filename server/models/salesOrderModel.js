const { SalesOrder, SalesOrderItem, Product, Customer } = require("./index");
const database = require("../config/database");
const { Op } = require("sequelize");

/**
 * Sales Order Model using Sequelize ORM
 * Handles sales orders with transactions for data integrity
 */
class SalesOrderModel {
  /**
   * Get all sales orders with items
   */
  async getAll() {
    try {
      const orders = await SalesOrder.findAll({
        include: [
          {
            model: Customer,
            attributes: ["id", "name", "email", "phone"],
            required: false,
          },
          {
            model: SalesOrderItem,
            as: "items",
            include: [{
              model: Product,
              attributes: ["id", "name", "sku"],
            }],
          },
        ],
        order: [["orderDate", "DESC"]],
      });
      
      // Transform to plain objects with items array and customer name
      return orders.map(order => {
        const data = order.toJSON();
        return {
          ...data,
          // Keep sales order snapshot fields (customerName/email/phone/address) as-is.
          // Expose the linked customer (if any) separately.
          customer: data.Customer || null,
          items: data.items || [],
          Customer: undefined, // Remove nested Customer object
        };
      });
    } catch (error) {
      console.error("Error getting all sales orders:", error);
      return [];
    }
  }

  /**
   * Get sales order by ID with items
   */
  async getById(id) {
    try {
      const order = await SalesOrder.findByPk(id, {
        include: [
          {
            model: Customer,
            attributes: ["id", "name", "email", "phone", "address"],
            required: false,
          },
          {
            model: SalesOrderItem,
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
        // Keep sales order snapshot fields (customerName/email/phone/address) as-is.
        // Expose the linked customer (if any) separately.
        customer: data.Customer || null,
        items: data.items || [],
        Customer: undefined, // Remove nested Customer object
      };
    } catch (error) {
      console.error("Error getting sales order by ID:", error);
      return null;
    }
  }

  /**
   * Create new sales order with items (transactional)
   */
  async create(salesOrderData) {
    return await database.transaction(async (t) => {
      try {
        const { items, ...orderData } = salesOrderData;
        
        // Create the order
        const order = await SalesOrder.create(orderData, { transaction: t });
        
        // Create order items
        if (items && items.length > 0) {
          const orderItems = items.map(item => ({
            ...item,
            salesOrderId: order.id,
          }));
          
          await SalesOrderItem.bulkCreate(orderItems, { transaction: t });
        }
        
        // Fetch complete order with items
        const completeOrder = await SalesOrder.findByPk(order.id, {
          include: [{ model: SalesOrderItem, as: "items" }],
          transaction: t,
        });
        
        return completeOrder;
      } catch (error) {
        console.error("Error creating sales order:", error);
        throw error; // Transaction will rollback
      }
    });
  }

  /**
   * Update sales order with items (transactional)
   */
  async update(id, salesOrderData) {
    return await database.transaction(async (t) => {
      try {
        const { items, ...orderData } = salesOrderData;
        
        const order = await SalesOrder.findByPk(id, { transaction: t });
        
        if (!order) {
          throw new Error("Sales order not found");
        }
        
        // Update order
        await order.update(orderData, { transaction: t });
        
        // Update items if provided
        if (items) {
          // Delete existing items
          await SalesOrderItem.destroy({
            where: { salesOrderId: id },
            transaction: t,
          });
          
          // Create new items
          if (items.length > 0) {
            const orderItems = items.map(item => ({
              ...item,
              salesOrderId: id,
            }));
            
            await SalesOrderItem.bulkCreate(orderItems, { transaction: t });
          }
        }
        
        // Fetch complete order with items
        const completeOrder = await SalesOrder.findByPk(id, {
          include: [{ model: SalesOrderItem, as: "items" }],
          transaction: t,
        });
        
        return completeOrder;
      } catch (error) {
        console.error("Error updating sales order:", error);
        throw error; // Transaction will rollback
      }
    });
  }

  /**
   * Delete sales order
   */
  async delete(id) {
    try {
      const order = await SalesOrder.findByPk(id, {
        include: [{ model: SalesOrderItem, as: "items" }],
      });
      
      if (!order) {
        return { success: false, message: "Sales order not found" };
      }
      
      const orderData = order.toJSON();
      await order.destroy(); // Items will be CASCADE deleted
      
      return orderData;
    } catch (error) {
      console.error("Error deleting sales order:", error);
      return { success: false, message: "Error deleting sales order" };
    }
  }

  /**
   * Get orders by date range
   */
  async getByDateRange(startDate, endDate) {
    try {
      return await SalesOrder.findAll({
        where: {
          orderDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [{ model: SalesOrderItem, as: "items" }],
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
      return await SalesOrder.findAll({
        where: { status },
        include: [{ model: SalesOrderItem, as: "items" }],
        order: [["orderDate", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting orders by status:", error);
      return [];
    }
  }
}

module.exports = new SalesOrderModel();
