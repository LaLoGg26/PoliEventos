const eventoService = require("../services/evento.service");

// GET /api/eventos
async function getEventos(req, res) {
  try {
    const eventos = await eventoService.findAll();
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /api/eventos/:id
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

// POST /api/eventos/comprar
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
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({
      message: error.message || "Error interno al procesar la compra.",
    });
  }
}

// POST /api/eventos (Crear Evento - ACTUALIZADO)
async function postCreateEvento(req, res) {
  const usuario_id = req.user.id;
  // Extraemos tiposBoletos del body
  const { nombre, descripcion, fecha, lugar, imagen_url, tiposBoletos } =
    req.body;

  if (!nombre || !fecha || !lugar) {
    return res
      .status(400)
      .json({ message: "Nombre, fecha y lugar son requeridos." });
  }

  // Validación de boletos
  if (
    !tiposBoletos ||
    !Array.isArray(tiposBoletos) ||
    tiposBoletos.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Debes agregar al menos un tipo de boleto." });
  }

  try {
    const newEvento = await eventoService.createEvento(
      nombre,
      descripcion,
      fecha,
      lugar,
      imagen_url,
      usuario_id,
      tiposBoletos
    );
    res.status(201).json({
      message: "Evento y boletos creados exitosamente.",
      evento: newEvento,
    });
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
