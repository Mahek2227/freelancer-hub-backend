import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  sendInvoice,
  payInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);
router.put("/:id", protect, updateInvoice);
router.post("/:id/send", protect, sendInvoice);
router.post("/:id/pay", protect, payInvoice);
router.delete("/:id", protect, deleteInvoice);

export default router;
