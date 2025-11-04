import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import Ticket from "../models/Ticket.js";

export const generateTicket = async (req, res) => {
  try {
    const { name, email, eventName } = req.body;
    const ticketId = uuidv4();

    const ticket = await Ticket.create({
      ticketId,
      name,
      email,
      eventName,
    });

    const qrData = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/validate/${ticketId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(201).json({
      message: "Boleto generado exitosamente",
      ticket,
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generando boleto" });
  }
};
