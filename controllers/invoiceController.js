import Invoice from "../models/Invoice.js";

export const createInvoice = async (req, res) => {
  try {
    const { project, freelancer, amount, dueDate, description } = req.body;

    // ✅ CHECK: only 1 invoice per project
    const existingInvoice = await Invoice.findOne({ project });

    if (existingInvoice) {
      return res.status(400).json({
        message: "Invoice already exists for this project",
      });
    }

    // Create invoice
    const invoiceData = new Invoice({
      project,
      client: req.user._id,
      freelancer,
      amount,
      dueDate,
      description: description || "Project payment",
      status: "pending",
    });

    const newInvoice = await invoiceData.save();
    await newInvoice.populate("project client freelancer");

    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    let invoices;

    if (req.user.role === "client") {
      // Client sees invoices they created
      invoices = await Invoice.find({ client: req.user._id })
        .populate("freelancer", "name email")
        .populate("project", "title")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "freelancer") {
      // Freelancer sees invoices sent to them
      invoices = await Invoice.find({ freelancer: req.user._id })
        .populate("client", "name email")
        .populate("project", "title")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("freelancer", "name email")
      .populate("client", "name email")
      .populate("project", "title description");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check authorization
    if (
      invoice.client._id.toString() !== req.user._id.toString() &&
      invoice.freelancer._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this invoice" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Only client can update
    if (invoice.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this invoice" });
    }

    if (req.body.amount) invoice.amount = req.body.amount;
    if (req.body.dueDate) invoice.dueDate = req.body.dueDate;
    if (req.body.description) invoice.description = req.body.description;
    if (req.body.status && ["pending", "sent", "paid", "overdue", "refunded", "cancelled"].includes(req.body.status)) {
      invoice.status = req.body.status;
    }

    await invoice.save();
    await invoice.populate("project client freelancer");

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Only client can delete
    if (invoice.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this invoice" });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Either client or freelancer can mark as paid
    // ✅ ONLY CLIENT CAN PAY
    if (invoice.client.toString() !== req.user._id.toString()) {
     return res.status(403).json({
     message: "Only client can pay invoice",
     });
    }
    // prevent double payment
    if (invoice.status === "paid") {
      return res.status(400).json({
      message: "Invoice already paid",
  });
}

    invoice.status = "paid";
    invoice.paidDate = new Date();
    await invoice.save();
    await invoice.populate("project client freelancer");

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
      
