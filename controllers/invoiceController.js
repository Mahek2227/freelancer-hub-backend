import mongoose from "mongoose";

// Define Invoice schema if it doesn't exist
const invoiceSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "Project payment",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "paid", "overdue", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "bank_transfer", "paypal"],
      default: "stripe",
    },
    transactionId: String,
    notes: String,
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export const createInvoice = async (req, res) => {
  try {
    const { projectId, freelancerId, amount, dueDate, description } = req.body;

    const newInvoice = await Invoice.create({
      project: projectId,
      client: req.user._id,
      freelancer: freelancerId,
      amount,
      dueDate,
      description: description || "Project payment",
      status: "pending",
    });

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
        .populate("project", "title");
    } else if (req.user.role === "freelancer") {
      // Freelancer sees invoices sent to them
      invoices = await Invoice.find({ freelancer: req.user._id })
        .populate("client", "name email")
        .populate("project", "title");
    }

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("freelancer", "name email bank_account")
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
    if (req.body.status) invoice.status = req.body.status;

    await invoice.save();

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: "sent" },
      { new: true }
    ).populate("freelancer", "name email");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Here you would send an email to the freelancer
    // await sendEmail(invoice.freelancer.email, ...);

    res.status(200).json({ message: "Invoice sent", invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const payInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check authorization
    if (invoice.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only client can pay this invoice" });
    }

    // In production, integrate with Stripe or PayPal
    // const charge = await stripe.charges.create({...});
    // invoice.transactionId = charge.id;

    invoice.status = "paid";
    await invoice.save();

    res.status(200).json({ message: "Payment processed", invoice });
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

    // Can only delete if unpaid
    if (invoice.status === "paid" || invoice.status === "sent") {
      return res
        .status(400)
        .json({ message: "Cannot delete paid or sent invoices" });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
