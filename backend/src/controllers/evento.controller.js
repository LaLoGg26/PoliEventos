const eventoService = require("../services/evento.service");

// Controlador GET /api/eventos
async function getEventos(req, res) {
  try {
    const eventos = await eventoService.findAll();
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Controlador GET /api/eventos/:id
async function getEventoById(req, res) {
  const { id } = req.params;
  try {
    const evento = await eventoService.findById(id);
    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Controlador POST /api/eventos/comprar
async function postComprarBoletos(req, res) {
  const { boletoId, cantidad } = req.body;

  if (!boletoId || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: "Datos de compra inválidos." });
  }

  try {
    const result = await eventoService.comprarBoletos(boletoId, cantidad);
    res.json(result);
  } catch (error) {
    if (error.message.includes("Inventario insuficiente")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({
      message:
        error.message || "Error interno del servidor al procesar la compra.",
    });
  }
}

async function postCreateEvento(req, res) {
  // El ID del usuario creador viene del token decodificado (req.user)
  const usuario_id = req.user.id;
  const { nombre, descripcion, fecha, lugar, imagen_url } = req.body;

  if (!nombre || !fecha || !lugar) {
    return res
      .status(400)
      .json({ message: "Los campos Nombre, Fecha y Lugar son requeridos." });
  }

  try {
    const newEvento = await eventoService.createEvento(
      nombre,
      descripcion,
      fecha,
      lugar,
      imagen_url,
      usuario_id
    );
    res
      .status(201)
      .json({ message: "Evento creado exitosamente.", evento: newEvento });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error al crear el evento." });
  }
}

module.exports = {
  getEventos,
  getEventoById,
  postComprarBoletos,
  postCreateEvento,
};
