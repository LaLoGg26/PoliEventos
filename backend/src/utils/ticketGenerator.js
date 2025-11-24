const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

// Configuración robusta para Gmail en la nube (Render)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // ⭐️ CONFIGURACIÓN CRÍTICA PARA RENDER ⭐️
  pool: true, // Reutilizar conexiones
  maxConnections: 1, // No saturar a Google
  rateLimit: 4, // Forzar IPv4 (evita errores ETIMEDOUT en la nube)
});

async function generarYEnviarBoleto(
  listaUUIDs,
  evento,
  usuario,
  tipoBoleto,
  datosCompra
) {
  return new Promise(async (resolve, reject) => {
    try {
      // Validar credenciales antes de empezar
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error(
          "❌ Faltan credenciales EMAIL_USER o EMAIL_PASS en las variables de entorno."
        );
        return; // Salimos silenciosamente para no romper la compra, pero logueamos el error
      }

      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfData = Buffer.concat(buffers);
        try {
          console.log(`📧 Intentando enviar correo a: ${usuario.email}`);

          await transporter.sendMail({
            from: `"Poli Eventos" <${process.env.EMAIL_USER}>`,
            to: usuario.email,
            subject: `🎟️ Tus boletos para: ${evento.nombre}`,
            html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1>¡Hola ${usuario.nombre}!</h1>
                                <p>Gracias por tu compra. Aquí tienes tus entradas para <strong>${evento.nombre}</strong>.</p>
                                <p>Adjunto encontrarás un archivo PDF con tus boletos y códigos QR.</p>
                                <hr/>
                                <p style="font-size: 12px; color: #777;">Orden de Compra #${datosCompra.id_compra}</p>
                            </div>
                        `,
            attachments: [{ filename: "MisBoletos.pdf", content: pdfData }],
          });

          console.log("✅ Correo enviado exitosamente.");
          resolve(true);
        } catch (error) {
          console.error("❌ Error enviando email:", error);
          reject(error);
        }
      });

      // --- DISEÑO DEL BOLETO (Ticketmaster Style) ---
      const primaryColor = "#2563EB";
      const grayColor = "#444444";

      for (let i = 0; i < listaUUIDs.length; i++) {
        const uuidActual = listaUUIDs[i];
        if (i > 0) doc.addPage();

        // Encabezado Azul
        doc.rect(0, 0, 600, 100).fill(primaryColor);
        doc
          .fontSize(28)
          .fillColor("white")
          .font("Helvetica-Bold")
          .text("Poli Eventos", 0, 35, { align: "center" });

        // Caja del boleto
        doc.roundedRect(50, 130, 500, 600, 10).stroke("#dddddd");

        // Info del Evento
        doc.moveDown(3);
        doc
          .fillColor("black")
          .fontSize(22)
          .font("Helvetica-Bold")
          .text(evento.nombre, { align: "center" });

        const startY = 220;
        doc.fontSize(12).font("Helvetica-Bold").fillColor(grayColor);

        doc.text("LUGAR:", 100, startY);
        doc.font("Helvetica").text(evento.lugar, 200, startY);

        doc.font("Helvetica-Bold").text("FECHA:", 100, startY + 30);
        doc
          .font("Helvetica")
          .text(new Date(evento.fecha).toLocaleString(), 200, startY + 30);

        doc.font("Helvetica-Bold").text("ZONA:", 100, startY + 60);
        doc.font("Helvetica").text(tipoBoleto.nombre_zona, 200, startY + 60);

        // Código QR
        const qrDataUrl = await QRCode.toDataURL(uuidActual);
        doc.image(qrDataUrl, 195, 350, { fit: [200, 200], align: "center" });

        doc
          .fontSize(10)
          .fillColor("#777")
          .text(uuidActual, 0, 560, { align: "center" });
        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .text(`Boleto ${i + 1} de ${listaUUIDs.length}`, 0, 590, {
            align: "center",
          });
      }

      doc.end();
    } catch (error) {
      console.error("Error generando PDF:", error);
      reject(error);
    }
  });
}

module.exports = { generarYEnviarBoleto };
