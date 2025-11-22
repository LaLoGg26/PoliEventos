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

  // Multer pone el archivo en req.file
  const imagen_url = req.file ? req.file.path : null;

  // Ahora los datos vienen en req.body (como texto), hay que parsearlos
  // porque al enviar archivos, FormData convierte todo a strings
  const { nombre, descripcion, fecha, lugar, latitud, longitud } = req.body;

  let tiposBoletos;
  try {
    tiposBoletos = JSON.parse(req.body.tiposBoletos); // Parsear el string a JSON
  } catch (e) {
    return res.status(400).json({ message: "Formato de boletos inválido." });
  }

  if (!nombre || !fecha || !lugar) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const newEvento = await eventoService.createEvento(
      nombre,
      descripcion,
      fecha,
      lugar,
      imagen_url,
      usuario_id,
      tiposBoletos,
      latitud,
      longitud
    );
    res.status(201).json({ message: "Evento creado.", evento: newEvento });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ... (imports y funciones anteriores)

// GET /api/eventos/dashboard/mis-eventos
async function getDashboardEvents(req, res) {
  try {
    const eventos = await eventoService.getEventsForDashboard(
      req.user.id,
      req.user.rol
    );
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /api/eventos/:id
async function deleteEvento(req, res) {
  const { id } = req.params;
  try {
    await eventoService.deleteEvento(id, req.user.id, req.user.rol);
    res.json({ message: "Evento eliminado correctamente." });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
}

// PUT /api/eventos/:id
async function updateEvento(req, res) {
  const { id } = req.params;
  try {
    // req.body trae { nombre, descripcion, ... }
    const updated = await eventoService.updateEvento(
      id,
      req.user.id,
      req.user.rol,
      req.body
    );
    res.json({ message: "Evento actualizado.", evento: updated });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
}

// ACTUALIZA EL EXPORT:
module.exports = {
  getEventos,
  getEventoById,
  postComprarBoletos,
  postCreateEvento,
  getDashboardEvents, // Nuevo
  deleteEvento, // Nuevo
  updateEvento, // Nuevo
};
