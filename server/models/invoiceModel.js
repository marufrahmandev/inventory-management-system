const { Invoice, InvoiceItem, Product, SalesOrder } = require("./index");
const database = require("../config/database");
const { Op } = require("sequelize");

/**
 * Invoice Model using Sequelize ORM
 * Handles invoices with transactions for data integrity
 */
class InvoiceModel {
  /**
   * Get all invoices with items
   */
  async getAll() {
    try {
      const invoices = await Invoice.findAll({
        include: [{
          model: InvoiceItem,
          as: "items",
          include: [{
            model: Product,
            attributes: ["id", "name", "sku"],
          }],
        }],
        order: [["invoiceDate", "DESC"]],
      });
      
      return invoices.map(invoice => {
        const data = invoice.toJSON();
        return {
          ...data,
          items: data.items || [],
        };
      });
    } catch (error) {
      console.error("Error getting all invoices:", error);
      return [];
    }
  }

  /**
   * Get invoice by ID with items
   */
  async getById(id) {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [{
          model: InvoiceItem,
          as: "items",
          include: [{
            model: Product,
            attributes: ["id", "name", "sku"],
          }],
        }],
      });
      
      if (!invoice) {
        return { success: false, message: "Invoice not found" };
      }
      
      const data = invoice.toJSON();
      return {
        ...data,
        items: data.items || [],
      };
    } catch (error) {
      console.error("Error getting invoice by ID:", error);
      return { success: false, message: "Error reading invoice" };
    }
  }

  /**
   * Create new invoice with items (transactional)
   */
  async create(invoiceData) {
    return await database.transaction(async (t) => {
      try {
        const { items, ...invData } = invoiceData;
        
        const invoice = await Invoice.create(invData, { transaction: t });
        
        if (items && items.length > 0) {
          const invoiceItems = items.map(item => ({
            ...item,
            invoiceId: invoice.id,
          }));
          
          await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
        }
        
        const completeInvoice = await Invoice.findByPk(invoice.id, {
          include: [{ model: InvoiceItem, as: "items" }],
          transaction: t,
        });
        
        return completeInvoice;
      } catch (error) {
        console.error("Error creating invoice:", error);
        throw error;
      }
    });
  }

  /**
   * Update invoice with items (transactional)
   */
  async update(id, invoiceData) {
    return await database.transaction(async (t) => {
      try {
        const { items, ...invData } = invoiceData;
        
        const invoice = await Invoice.findByPk(id, { transaction: t });
        
        if (!invoice) {
          throw new Error("Invoice not found");
        }
        
        await invoice.update(invData, { transaction: t });
        
        if (items) {
          await InvoiceItem.destroy({
            where: { invoiceId: id },
            transaction: t,
          });
          
          if (items.length > 0) {
            const invoiceItems = items.map(item => ({
              ...item,
              invoiceId: id,
            }));
            
            await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
          }
        }
        
        const completeInvoice = await Invoice.findByPk(id, {
          include: [{ model: InvoiceItem, as: "items" }],
          transaction: t,
        });
        
        return completeInvoice;
      } catch (error) {
        console.error("Error updating invoice:", error);
        throw error;
      }
    });
  }

  /**
   * Delete invoice
   */
  async delete(id) {
    try {
      const invoice = await Invoice.findByPk(id, {
        include: [{ model: InvoiceItem, as: "items" }],
      });
      
      if (!invoice) {
        return { success: false, message: "Invoice not found" };
      }
      
      const invoiceData = invoice.toJSON();
      await invoice.destroy();
      
      return invoiceData;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return { success: false, message: "Error deleting invoice" };
    }
  }

  /**
   * Get invoices by sales order ID
   */
  async getBySalesOrderId(salesOrderId) {
    try {
      return await Invoice.findAll({
        where: { salesOrderId },
        include: [{ model: InvoiceItem, as: "items" }],
        order: [["invoiceDate", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting invoices by sales order:", error);
      return [];
    }
  }

  /**
   * Get invoices by date range
   */
  async getByDateRange(startDate, endDate) {
    try {
      return await Invoice.findAll({
        where: {
          invoiceDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [{ model: InvoiceItem, as: "items" }],
        order: [["invoiceDate", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting invoices by date range:", error);
      return [];
    }
  }

  /**
   * Get invoices by status
   */
  async getByStatus(status) {
    try {
      return await Invoice.findAll({
        where: { status },
        include: [{ model: InvoiceItem, as: "items" }],
        order: [["invoiceDate", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting invoices by status:", error);
      return [];
    }
  }

  /**
   * Generate next invoice number (INV-YYYY-000001 format)
   */
  async getNextInvoiceNumber() {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    const lastInvoice = await Invoice.findOne({
      where: {
        invoiceNumber: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["invoiceNumber", "DESC"]],
      attributes: ["invoiceNumber"],
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.split("-")[2]);
      nextNumber = lastNum + 1;
    }

    const pad6 = (num) => String(num).padStart(6, "0");
    return `${prefix}${pad6(nextNumber)}`;
  }
}

module.exports = new InvoiceModel();
