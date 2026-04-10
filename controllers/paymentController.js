import Invoice from "../models/Invoice.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const { project, amount, dueDate, description } = req.body;
    const userId = req.user._id;

    // Verify project exists and user is client
    const projectData = await Project.findById(project);
    if (!projectData) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (projectData.client.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only project client can create invoices" });
    }

    const invoice = new Invoice({
      project,
      client: userId,
      freelancer: projectData.freelancer,
      amount,
      dueDate,
      description,
      status: "pending",
    });

    await invoice.save();
    const populatedInvoice = await invoice.populate("project client freelancer");

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get invoices for user
export const getInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let filter = {
      $or: [{ client: userId }, { freelancer: userId }],
    };

    if (status) {
      filter.status = status;
    }

    const invoices = await Invoice.find(filter)
      .populate("project client freelancer")
      .sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single invoice
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "project client freelancer"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check authorization
    if (
      invoice.client._id.toString() !== req.user._id.toString() &&
      invoice.freelancer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Only client can change invoice status
    if (invoice.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Valid statuses
    const validStatuses = ["pending", "sent", "paid", "cancelled", "overdue"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    invoice.status = status;
    if (status === "paid") {
      invoice.paidDate = new Date();
    }

    await invoice.save();
    const updatedInvoice = await invoice.populate("project client freelancer");

    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process payment (mock - in production use Stripe/PayPal)
export const processPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Verify it's the freelancer paying
    if (invoice.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only freelancer can pay invoice" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Invoice already paid" });
    }

    // Mock payment processing
    invoice.status = "paid";
    invoice.paidDate = new Date();
    await invoice.save();

    const updatedInvoice = await invoice.populate("project client freelancer");

    res.status(200).json({
      message: "Payment processed successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Only client can delete
    if (invoice.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
