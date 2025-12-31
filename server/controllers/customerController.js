const customerModel = require("../models/customerModel");

class CustomerController {
  async getAll(req, res) {
    try {
      const customers = await customerModel.getAll();
      return res.status(200).json({ success: true, data: customers });
    } catch (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({
        message: "Error fetching customers",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const customer = await customerModel.getById(id);

      if (!customer || !customer.id) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({
        message: "Error fetching customer",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        taxId,
        creditLimit,
        status,
        notes,
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          message: "Customer name is required",
        });
      }

      const customerData = {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || "USA",
        taxId: taxId || null,
        creditLimit: creditLimit !== undefined ? parseFloat(creditLimit) : 0,
        currentBalance: 0,
        status: status || "active",
        notes: notes || null,
      };

      const newCustomer = await customerModel.create(customerData);
      return res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      return res.status(500).json({
        message: "Error creating customer",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingCustomer = await customerModel.getById(id);

      if (!existingCustomer || !existingCustomer.id) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        taxId,
        creditLimit,
        status,
        notes,
      } = req.body;

      const customerData = {
        name: name || existingCustomer.name,
        email: email !== undefined ? email : existingCustomer.email,
        phone: phone !== undefined ? phone : existingCustomer.phone,
        address: address !== undefined ? address : existingCustomer.address,
        city: city !== undefined ? city : existingCustomer.city,
        state: state !== undefined ? state : existingCustomer.state,
        zipCode: zipCode !== undefined ? zipCode : existingCustomer.zipCode,
        country: country !== undefined ? country : existingCustomer.country,
        taxId: taxId !== undefined ? taxId : existingCustomer.taxId,
        creditLimit:
          creditLimit !== undefined
            ? parseFloat(creditLimit)
            : existingCustomer.creditLimit,
        status: status || existingCustomer.status,
        notes: notes !== undefined ? notes : existingCustomer.notes,
      };

      const updatedCustomer = await customerModel.update(id, customerData);
      return res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      return res.status(500).json({
        message: "Error updating customer",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existingCustomer = await customerModel.getById(id);

      if (!existingCustomer || !existingCustomer.id) {
        return res.status(404).json({ message: "Customer not found" });
      }

      await customerModel.delete(id);
      return res.status(200).json({
        message: "Customer deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      return res.status(500).json({
        message: "Error deleting customer",
        error: error.message,
      });
    }
  }
}

module.exports = new CustomerController();

