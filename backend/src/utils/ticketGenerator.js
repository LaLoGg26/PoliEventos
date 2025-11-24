const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

// Configuración BREVO (Sendinblue) Definitiva
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587, // Puerto estándar TLS
  secure: false, // false para 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_LOGIN || process.env.EMAIL_USER, // Login de Brevo
    pass: process.env.EMAIL_PASS, // Clave SMTP
  },
  // ⭐️ CONFIGURACIÓN DE RED CRÍTICA ⭐️
  family: 4, // Forzar IPv4 (Evita ETIMEDOUT en Render)
  pool: true, // Mantiene la conexión viva
  maxConnections: 2, // Pocas conexiones simultáneas
  rateLimit: 2, // Límite de velocidad suave
  tls: {
    rejectUnauthorized: false, // Permite certificados flexibles
  },
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
      // Validación de seguridad
      if (!process.env.EMAIL_PASS) {
        console.error("❌ Faltan credenciales de correo.");
        return resolve(false);
      }

      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfData = Buffer.concat(buffers);
        try {
          console.log(`📧 Conectando a Brevo para enviar a: ${usuario.email}`);

          await transporter.sendMail({
            from: `"Poli Eventos" <${process.env.EMAIL_USER}>`, // Remitente (Tu Gmail)
            to: usuario.email,
            subject: `🎟️ Tus boletos para: ${evento.nombre}`,
            html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1>¡Hola ${usuario.nombre}!</h1>
                                <p>Gracias por tu compra. Aquí tienes tus entradas para <strong>${evento.nombre}</strong>.</p>
                                <p>Adjunto encontrarás el PDF con tus boletos.</p>
                            </div>
                        `,
            attachments: [{ filename: "Boletos.pdf", content: pdfData }],
          });

          console.log("✅ Correo enviado exitosamente.");
          resolve(true);
        } catch (error) {
          console.error("❌ Error enviando email:", error);
          // No rechazamos para no romper el flujo de compra
          resolve(false);
        }
      });

      // --- DISEÑO DEL PDF ---
      const primaryColor = "#2563EB";
      const grayColor = "#444444";

      for (let i = 0; i < listaUUIDs.length; i++) {
        const uuidActual = listaUUIDs[i];
        if (i > 0) doc.addPage();

        doc.rect(0, 0, 600, 100).fill(primaryColor);
        doc
          .fontSize(28)
          .fillColor("white")
          .font("Helvetica-Bold")
          .text("Poli Eventos", 0, 35, { align: "center" });

        doc.roundedRect(50, 130, 500, 600, 10).stroke("#dddddd");

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

        const qrDataUrl = await QRCode.toDataURL(uuidActual);
        doc.image(qrDataUrl, 195, 380, { fit: [200, 200], align: "center" });
        doc
          .fontSize(10)
          .fillColor("#777")
          .text(uuidActual, 0, 600, { align: "center" });
      }
      doc.end();
    } catch (error) {
      console.error("Error generando PDF:", error);
      reject(error);
    }
  });
}

module.exports = { generarYEnviarBoleto };
