import express from "express";
import { register, login } from "../controllers/authController.js"; 

const router = express.Router();   // ← THIS LINE WAS MISSING

router.post("/register", register);
router.post("/login", login);


export default router;
