const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

// Configurar el "cartero" (Transporter)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Genera un PDF con el boleto y lo envía por correo.
 * @param {Object} compra - Datos de la compra (uuid, total, cantidad)
 * @param {Object} evento - Datos del evento (nombre, fecha, lugar)
 * @param {Object} usuario - Datos del comprador (nombre, email)
 * @param {Object} tipoBoleto - Datos del boleto (zona, precio)
 */
async function generarYEnviarBoleto(compra, evento, usuario, tipoBoleto) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      // Capturar el PDF en memoria
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfData = Buffer.concat(buffers);

        // Enviar el correo
        try {
          await transporter.sendMail({
            from: `"Poli Eventos Ticketera" <${process.env.EMAIL_USER}>`,
            to: usuario.email,
            subject: `🎟️ Tus boletos para: ${evento.nombre}`,
            html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1>¡Hola ${usuario.nombre}!</h1>
                                <p>Gracias por tu compra. Aquí tienes tus boletos para <strong>${evento.nombre}</strong>.</p>
                                <p>Por favor, presenta el archivo PDF adjunto o el código QR en la entrada del evento.</p>
                                <br>
                                <p style="font-size: 12px; color: #777;">ID de Compra: ${compra.uuid_unico}</p>
                            </div>
                        `,
            attachments: [
              {
                filename: `Boleto-${evento.nombre.replace(/\s+/g, "-")}.pdf`,
                content: pdfData,
              },
            ],
          });
          console.log(`Correo enviado a ${usuario.email}`);
          resolve(true);
        } catch (error) {
          console.error("Error enviando email:", error);
          reject(error);
        }
      });

      // --- DIBUJAR EL PDF ---

      // Encabezado
      doc
        .fontSize(26)
        .fillColor("#2563EB")
        .text("Poli Eventos", { align: "center" });
      doc.moveDown(0.5);
      doc
        .fontSize(18)
        .fillColor("#111")
        .text(evento.nombre, { align: "center" });
      doc.moveDown();

      // Línea divisoria
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Detalles
      doc.fontSize(14).fillColor("#444");
      doc.text(`📍 Lugar: ${evento.lugar}`);
      doc.text(`📅 Fecha: ${new Date(evento.fecha).toLocaleString()}`);
      doc.moveDown(0.5);
      doc.text(
        `🎫 Zona: ${tipoBoleto.nombre_zona}  |  Cantidad: ${compra.cantidad}`
      );
      doc.text(`💰 Total Pagado: $${compra.total}`);
      doc.moveDown(2);

      // Generar QR
      const qrDataUrl = await QRCode.toDataURL(compra.uuid_unico);

      doc.image(qrDataUrl, {
        fit: [180, 180],
        align: "center",
        valign: "center",
      });

      doc.moveDown(10);
      doc
        .fontSize(10)
        .fillColor("#777")
        .text(`UUID: ${compra.uuid_unico}`, { align: "center" });
      doc.text("Este boleto es único e intransferible.", { align: "center" });

      // Finalizar PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generarYEnviarBoleto };
