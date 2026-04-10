import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  processPayment,
  deleteInvoice,
} from "../controllers/paymentController.js";

const router = express.Router();

// Invoice routes
router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);
router.put("/:id/status", protect, updateInvoiceStatus);
router.post("/:id/pay", protect, processPayment);
router.delete("/:id", protect, deleteInvoice);

export default router;
