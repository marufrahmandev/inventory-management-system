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

      return res.status(200).json({ success: true, data: customer });
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
        paymentTerms,
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
        paymentTerms: paymentTerms || null,
        currentBalance: 0,
        status: status || "active",
        notes: notes || null,
      };

      const newCustomer = await customerModel.create(customerData);
      return res.status(201).json({ success: true, data: newCustomer });
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


      console.log("Request body:", JSON.stringify(req.body, null, 2));

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
        paymentTerms,
        status,
        notes,
      } = req.body;

      // Build update object - include all fields that are in the request body
      const customerData = {};
      
      // Check if field exists in request body (not just undefined check)
      if (name !== undefined && name !== null) customerData.name = name;
      if (email !== undefined) customerData.email = email === "" ? null : email;
      if (phone !== undefined) customerData.phone = phone === "" ? null : phone;
      if (address !== undefined) customerData.address = address === "" ? null : address;
      if (city !== undefined) customerData.city = city === "" ? null : city;
      if (state !== undefined) customerData.state = state === "" ? null : state;
      if (zipCode !== undefined) customerData.zipCode = zipCode === "" ? null : zipCode;
      if (country !== undefined) customerData.country = country === "" ? null : country;
      if (taxId !== undefined) customerData.taxId = taxId === "" ? null : taxId;
      if (creditLimit !== undefined) {
        customerData.creditLimit = creditLimit === "" ? 0 : parseFloat(creditLimit);
      }
      // Always include paymentTerms if it exists in request body (even if empty string)
      // Use 'in' operator to check if key exists in req.body, not just undefined check
      if ('paymentTerms' in req.body) {
        customerData.paymentTerms = paymentTerms === "" || paymentTerms === null || paymentTerms === undefined 
          ? null 
          : String(paymentTerms).trim();
      }
      if (status !== undefined) customerData.status = status;
      if (notes !== undefined) customerData.notes = notes === "" ? null : notes;

      console.log("Updating customer with data:", JSON.stringify(customerData, null, 2));
      console.log("PaymentTerms value:", paymentTerms, "Type:", typeof paymentTerms);

      const updatedCustomer = await customerModel.update(id, customerData);
      return res.status(200).json({ success: true, data: updatedCustomer });
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

