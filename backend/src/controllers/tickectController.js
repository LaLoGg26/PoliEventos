import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export const generateTicket = async (req, res) => {
  try {
    const { nombre, evento } = req.body;

    // Generamos un ID único para el boleto
    const ticketId = uuidv4();

    // Creamos la data que irá dentro del QR
    const ticketData = {
      id: ticketId,
      nombre,
      evento,
      estado: "válido",
    };

    // Generamos el código QR (base64)
    const qrImage = await QRCode.toDataURL(JSON.stringify(ticketData));

    // En este punto podrías guardar en base de datos, por ahora solo devolvemos el QR
    res.json({
      success: true,
      qrImage,
      ticketData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error generando boleto" });
  }
};
