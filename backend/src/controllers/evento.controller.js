const eventoService = require("../services/evento.service");

// Controlador para GET /api/eventos
async function getEventos(req, res) {
  try {
    const eventos = await eventoService.findAll();
    res.json(eventos);
  } catch (error) {
    // Manejo de errores amigable
    res.status(500).json({ message: error.message });
  }
}

// Controlador para GET /api/eventos/:id
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

module.exports = {
  getEventos,
  getEventoById,
};
