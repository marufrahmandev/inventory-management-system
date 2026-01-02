const supplierModel = require("../models/supplierModel");

class SupplierController {
  async getAll(req, res) {
    try {
      const suppliers = await supplierModel.getAll();
      return res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return res.status(500).json({
        message: "Error fetching suppliers",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const supplier = await supplierModel.getById(id);

      if (!supplier || !supplier.id) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      console.error("Error fetching supplier:", error);
      return res.status(500).json({
        message: "Error fetching supplier",
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
        paymentTerms,
        bankDetails,
        status,
        notes,
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          message: "Supplier name is required",
        });
      }

      const supplierData = {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || "USA",
        taxId: taxId || null,
        paymentTerms: paymentTerms || null,
        bankDetails: bankDetails || null,
        currentBalance: 0,
        status: status || "active",
        notes: notes || null,
      };

      const newSupplier = await supplierModel.create(supplierData);
      return res.status(201).json({ success: true, data: newSupplier });
    } catch (error) {
      console.error("Error creating supplier:", error);
      return res.status(500).json({
        message: "Error creating supplier",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const existingSupplier = await supplierModel.getById(id);

      if (!existingSupplier || !existingSupplier.id) {
        return res.status(404).json({ message: "Supplier not found" });
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
        paymentTerms,
        bankDetails,
        status,
        notes,
      } = req.body;

      // Build update object - only include fields that are provided
      const supplierData = {};
      
      if (name !== undefined) supplierData.name = name;
      if (email !== undefined) supplierData.email = email === "" ? null : email;
      if (phone !== undefined) supplierData.phone = phone === "" ? null : phone;
      if (address !== undefined) supplierData.address = address === "" ? null : address;
      if (city !== undefined) supplierData.city = city === "" ? null : city;
      if (state !== undefined) supplierData.state = state === "" ? null : state;
      if (zipCode !== undefined) supplierData.zipCode = zipCode === "" ? null : zipCode;
      if (country !== undefined) supplierData.country = country === "" ? null : country;
      if (taxId !== undefined) supplierData.taxId = taxId === "" ? null : taxId;
      if (paymentTerms !== undefined) supplierData.paymentTerms = paymentTerms === "" ? null : paymentTerms;
      // Always include bankDetails if it's in the request (even if empty string)
      if (bankDetails !== undefined) {
        supplierData.bankDetails = bankDetails === "" || bankDetails === null ? null : bankDetails;
      }
      if (status !== undefined) supplierData.status = status;
      if (notes !== undefined) supplierData.notes = notes === "" ? null : notes;

      console.log("Updating supplier with data:", JSON.stringify(supplierData, null, 2));

      const updatedSupplier = await supplierModel.update(id, supplierData);
      return res.status(200).json({ success: true, data: updatedSupplier });
    } catch (error) {
      console.error("Error updating supplier:", error);
      return res.status(500).json({
        message: "Error updating supplier",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existingSupplier = await supplierModel.getById(id);

      if (!existingSupplier || !existingSupplier.id) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      await supplierModel.delete(id);
      return res.status(200).json({
        message: "Supplier deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      return res.status(500).json({
        message: "Error deleting supplier",
        error: error.message,
      });
    }
  }
}

module.exports = new SupplierController();

