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

      return res.status(200).json(supplier);
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
        currentBalance: 0,
        status: status || "active",
        notes: notes || null,
      };

      const newSupplier = await supplierModel.create(supplierData);
      return res.status(201).json(newSupplier);
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
        status,
        notes,
      } = req.body;

      const supplierData = {
        name: name || existingSupplier.name,
        email: email !== undefined ? email : existingSupplier.email,
        phone: phone !== undefined ? phone : existingSupplier.phone,
        address: address !== undefined ? address : existingSupplier.address,
        city: city !== undefined ? city : existingSupplier.city,
        state: state !== undefined ? state : existingSupplier.state,
        zipCode: zipCode !== undefined ? zipCode : existingSupplier.zipCode,
        country: country !== undefined ? country : existingSupplier.country,
        taxId: taxId !== undefined ? taxId : existingSupplier.taxId,
        paymentTerms:
          paymentTerms !== undefined
            ? paymentTerms
            : existingSupplier.paymentTerms,
        status: status || existingSupplier.status,
        notes: notes !== undefined ? notes : existingSupplier.notes,
      };

      const updatedSupplier = await supplierModel.update(id, supplierData);
      return res.status(200).json(updatedSupplier);
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

