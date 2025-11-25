const twilio = require("twilio");

const client = process.env.TWILIO_SID
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function generarYEnviarBoleto(
  listaUUIDs,
  evento,
  usuario,
  tipoBoleto,
  datosCompra
) {
  if (client) {
    try {
      // 1. Preparar el número de destino
      // Si el usuario no puso lada, asumimos México (+521)
      let telefonoDestino = usuario.telefono.trim();
      if (!telefonoDestino.startsWith("+")) {
        telefonoDestino = `+521${telefonoDestino}`; // Ajusta esto según tu país
      }

      // Formato de WhatsApp para Twilio
      const toWhatsapp = `whatsapp:${telefonoDestino}`;

      const mensajeWhatsApp = `
🎫 *¡Hola ${usuario.nombre}! Tu compra en PoliEventos fue exitosa.*

Evento: *${evento.nombre}*
Boletos: ${datosCompra.cantidad} x ${tipoBoleto.nombre_zona}
Total: $${datosCompra.total}

🔗 *Descarga tus boletos aquí:*
${process.env.FRONTEND_URL || "https://tu-proyecto.vercel.app"}/mis-tickets

_Presenta el QR en la entrada._
            `.trim();

      console.log(`📱 Intentando enviar WhatsApp a ${toWhatsapp}`);

      await client.messages.create({
        body: mensajeWhatsApp,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: toWhatsapp,
      });

      console.log("✅ WhatsApp enviado correctamente");
    } catch (error) {
      // Es normal que falle si el usuario no se ha unido al sandbox
      console.warn(
        "⚠️ No se pudo enviar WhatsApp (Usuario no unido al Sandbox):",
        error.message
      );
    }
  }
}

module.exports = { generarYEnviarBoleto };
