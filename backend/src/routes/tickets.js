import express from "express";
import { generateTicket } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/generate", generateTicket);

export default router;
