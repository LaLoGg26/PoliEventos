const eventoService = require("../services/evento.service");

async function getEventos(req, res) {
  try {
    res.json(await eventoService.findAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getEventoById(req, res) {
  const { id } = req.params;
  try {
    const evento = await eventoService.findById(id);
    if (!evento)
      return res.status(404).json({ message: "Evento no encontrado" });
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function postComprarBoletos(req, res) {
  const { boletoId, cantidad } = req.body;
  if (!req.user || !req.user.id)
    return res.status(401).json({ message: "Debes iniciar sesión." });
  if (!boletoId || !cantidad || cantidad <= 0)
    return res.status(400).json({ message: "Datos inválidos." });

  try {
    res.json(
      await eventoService.comprarBoletos(req.user.id, boletoId, cantidad)
    );
  } catch (error) {
    if (error.message.includes("Inventario"))
      return res.status(409).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
}

async function postCreateEvento(req, res) {
  const usuario_id = req.user.id;
  const imagen_url = req.file ? req.file.path : null;
  const { nombre, descripcion, fecha, lugar, latitud, longitud } = req.body;
  let tiposBoletos;
  try {
    tiposBoletos = JSON.parse(req.body.tiposBoletos);
  } catch (e) {
    return res.status(400).json({ message: "Error en boletos." });
  }

  if (!nombre || !fecha || !lugar)
    return res.status(400).json({ message: "Faltan campos." });

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

async function deleteEvento(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ message: "Se requiere contraseña." });
  try {
    await eventoService.deleteEvento(id, req.user.id, req.user.rol, password);
    res.json({ message: "Evento eliminado." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateEvento(req, res) {
  const { id } = req.params;
  const imagen_url = req.file ? req.file.path : req.body.imagen_url;
  const { nombre, descripcion, fecha, lugar, latitud, longitud } = req.body;
  let tiposBoletos;
  try {
    if (req.body.tiposBoletos) tiposBoletos = JSON.parse(req.body.tiposBoletos);
  } catch (e) {
    return res.status(400).json({ message: "Error boletos." });
  }
  const updateData = {
    nombre,
    descripcion,
    fecha,
    lugar,
    latitud,
    longitud,
    imagen_url,
    tiposBoletos,
  };

  try {
    const updated = await eventoService.updateEvento(
      id,
      req.user.id,
      req.user.rol,
      updateData
    );
    res.json({ message: "Evento actualizado.", evento: updated });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
}

async function getMisTickets(req, res) {
  try {
    res.json(await eventoService.getHistorialCompras(req.user.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function postReenviarCorreo(req, res) {
  const { compraId } = req.body;
  try {
    res.json(await eventoService.reenviarCorreoCompra(compraId, req.user.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ⭐️ NUEVO CONTROLADOR ⭐️
async function postValidarTicket(req, res) {
  const { uuid } = req.body;
  if (!uuid) return res.status(400).json({ message: "Falta el código." });
  try {
    const resultado = await eventoService.validarTicket(
      uuid,
      req.user.id,
      req.user.rol
    );
    res.json(resultado);
  } catch (error) {
    res.status(400).json({ message: error.message, valid: false });
  }
}

module.exports = {
  getEventos,
  getEventoById,
  postComprarBoletos,
  postCreateEvento,
  getDashboardEvents,
  deleteEvento,
  updateEvento,
  getMisTickets,
  postReenviarCorreo,
  postValidarTicket, // 👈 EXPORTAR
};
