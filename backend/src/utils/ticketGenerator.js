const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

console.log("Intentando configurar correo con:");
console.log("User:", process.env.EMAIL_USER ? "Definido" : "NO DEFINIDO");
console.log("Pass:", process.env.EMAIL_PASS ? "Definido" : "NO DEFINIDO");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  logger: true,
  debug: true,
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
      // Verificación previa
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Faltan credenciales de correo en el servidor.");
      }

      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfData = Buffer.concat(buffers);
        try {
          console.log("Enviando correo a:", usuario.email);
          await transporter.sendMail({
            from: `"Poli Eventos" <${process.env.EMAIL_USER}>`,
            to: usuario.email,
            subject: `Tus boletos para: ${evento.nombre}`,
            html: `<h1>¡Hola ${usuario.nombre}!</h1><p>Aquí tienes tus entradas.</p>`,
            attachments: [{ filename: "Boletos.pdf", content: pdfData }],
          });
          console.log("✅ Correo enviado con éxito");
          resolve(true);
        } catch (error) {
          console.error("❌ Error en transporter.sendMail:", error);
          reject(error);
        }
      });
      // --- COLORES Y ESTILOS ---
      const primaryColor = "#2563EB"; // Azul bonito
      const grayColor = "#444444";
      const lightGray = "#f3f4f6";

      for (let i = 0; i < listaUUIDs.length; i++) {
        const uuidActual = listaUUIDs[i];
        if (i > 0) doc.addPage();

        // 1. ENCABEZADO (Banner Azul)
        doc.rect(0, 0, 600, 100).fill(primaryColor);

        // Texto del Header (Blanco)
        doc
          .fontSize(28)
          .fillColor("white")
          .font("Helvetica-Bold")
          .text("Poli Eventos", 0, 35, { align: "center" });

        // 2. CUERPO DEL BOLETO (Recuadro)
        // Dibujamos un borde redondeado simulado
        doc.roundedRect(50, 130, 500, 600, 10).stroke("#dddddd");

        // Título del Evento
        doc.moveDown(3); // Bajar cursor
        doc
          .fillColor("black")
          .fontSize(22)
          .font("Helvetica-Bold")
          .text(evento.nombre, { align: "center" });

        doc.moveDown(0.5);

        // 3. TABLA DE INFORMACIÓN (Sin emojis para evitar errores)
        const startY = 220;
        const labelX = 100;
        const valueX = 200;
        const gap = 30;

        doc.fontSize(12).font("Helvetica-Bold").fillColor(grayColor);

        // Fila 1: Lugar
        doc.text("LUGAR:", labelX, startY);
        doc.font("Helvetica").text(evento.lugar, valueX, startY);

        // Fila 2: Fecha
        doc.font("Helvetica-Bold").text("FECHA:", labelX, startY + gap);
        doc
          .font("Helvetica")
          .text(new Date(evento.fecha).toLocaleString(), valueX, startY + gap);

        // Fila 3: Zona
        doc.font("Helvetica-Bold").text("ZONA:", labelX, startY + gap * 2);
        doc
          .font("Helvetica")
          .text(tipoBoleto.nombre_zona, valueX, startY + gap * 2);

        // Fila 4: Precio
        doc.font("Helvetica-Bold").text("PRECIO:", labelX, startY + gap * 3);
        doc
          .font("Helvetica")
          .text(`$${tipoBoleto.precio} MXN`, valueX, startY + gap * 3);

        // Línea punteada de separación
        doc
          .moveTo(70, 380)
          .lineTo(520, 380)
          .dash(5, { space: 5 })
          .stroke("#cccccc");

        // 4. CÓDIGO QR GIGANTE
        const qrDataUrl = await QRCode.toDataURL(uuidActual);
        doc.image(qrDataUrl, 195, 420, { fit: [200, 200], align: "center" });

        // 5. PIE DE BOLETO
        doc
          .fontSize(10)
          .fillColor("#777")
          .font("Helvetica")
          .text(uuidActual, 0, 630, { align: "center" });

        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .text(`Boleto ${i + 1} de ${listaUUIDs.length}`, 0, 650, {
            align: "center",
          });

        // Footer legal
        doc
          .fontSize(8)
          .fillColor("#999")
          .text(
            "Presenta este código en la entrada. Prohibida su venta.",
            0,
            700,
            { align: "center" }
          );
      }
      console.log("1.5. Dibujando boleto..."); // 👈 LOG NUEVO
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generarYEnviarBoleto };
