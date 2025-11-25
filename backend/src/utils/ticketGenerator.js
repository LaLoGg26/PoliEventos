const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function generarYEnviarBoleto(
  listaUUIDs,
  evento,
  usuario,
  tipoBoleto,
  datosCompra
) {
  return new Promise(async (resolve, reject) => {
    try {
      // Formatear número para WhatsApp (Twilio requiere formato E.164, ej: +52155...)
      // Asumimos que el usuario lo ingresó bien o le agregamos el prefijo si falta.
      // Para México es +521 + 10 dígitos.
      let telefonoDestino = usuario.telefono;

      // Un fix simple para asegurar que tenga el formato de whatsapp
      if (!telefonoDestino.startsWith("whatsapp:")) {
        telefonoDestino = `whatsapp:${telefonoDestino}`;
      }

      const mensaje = `
🎫 *¡Hola ${usuario.nombre}! Gracias por tu compra en PoliEventos.*

Has adquirido entradas para:
🎉 *${evento.nombre}*
📍 ${evento.lugar}
📅 ${new Date(evento.fecha).toLocaleString()}

🎟️ *Cantidad:* ${datosCompra.cantidad} boletos (${tipoBoleto.nombre_zona})
💰 *Total:* $${datosCompra.total}

👇 *TUS BOLETOS ESTÁN AQUÍ:*
${process.env.FRONTEND_URL || "https://tu-proyecto.vercel.app"}/mis-tickets

_Muestra el código QR de esa página en la entrada._
Orden #${datosCompra.id_compra}
            `.trim();

      console.log(`📱 Enviando WhatsApp a: ${telefonoDestino}`);

      const message = await client.messages.create({
        body: mensaje,
        from: process.env.TWILIO_WHATSAPP_NUMBER, // Tu número de Sandbox
        to: telefonoDestino,
      });

      console.log("✅ WhatsApp enviado, SID:", message.sid);
      resolve(true);
    } catch (error) {
      console.error("❌ Error enviando WhatsApp:", error);
      // No rechazamos para no romper la compra
      resolve(false);
    }
  });
}

module.exports = { generarYEnviarBoleto };
