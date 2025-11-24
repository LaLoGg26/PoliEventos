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

  // Verificar que el usuario esté logueado
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ message: "Debes iniciar sesión para comprar." });
  }

  const usuarioId = req.user.id;

  if (!boletoId || !cantidad || cantidad <= 0) {
    return res.status(400).json({ message: "Datos inválidos." });
  }

  try {
    // Pasamos usuarioId como primer parámetro
    const result = await eventoService.comprarBoletos(
      usuarioId,
      boletoId,
      cantidad
    );
    res.json(result);
  } catch (error) {
    if (error.message.includes("Inventario"))
      return res.status(409).json({ message: error.message });
    res.status(500).json({ message: error.message });
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
  const { password } = req.body; // 👈 Recibimos la contraseña

  if (!password) {
    return res
      .status(400)
      .json({ message: "Se requiere contraseña para confirmar." });
  }

  try {
    // Pasamos la password al servicio
    await eventoService.deleteEvento(id, req.user.id, req.user.rol, password);
    res.json({ message: "Evento eliminado correctamente." });
  } catch (error) {
    // Si es error de contraseña, solemos devolver 401 o 403, o 400 genérico
    res.status(400).json({ message: error.message });
  }
}

// PUT /api/eventos/:id
async function updateEvento(req, res) {
  const { id } = req.params;
  const imagen_url = req.file ? req.file.path : req.body.imagen_url;
  const { nombre, descripcion, fecha, lugar, latitud, longitud } = req.body;

  let tiposBoletos;
  try {
    if (req.body.tiposBoletos) {
      tiposBoletos = JSON.parse(req.body.tiposBoletos);
    }
  } catch (e) {
    return res.status(400).json({ message: "Formato de boletos inválido." });
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

// GET /api/eventos/usuario/mis-tickets
async function getMisTickets(req, res) {
  try {
    const historial = await eventoService.getHistorialCompras(req.user.id);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function postReenviarCorreo(req, res) {
  const { compraId } = req.body;
  try {
    const resultado = await eventoService.reenviarCorreoCompra(
      compraId,
      req.user.id
    );
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function postValidarTicket(req, res) {
  const { uuid } = req.body;
  if (!uuid)
    return res.status(400).json({ message: "Falta el código del ticket." });

  try {
    const resultado = await eventoService.validarTicket(
      uuid,
      req.user.id,
      req.user.rol
    );

    // Si es válido o usado, respondemos 200 pero con el status dentro
    res.json(resultado);
  } catch (error) {
    // Si es error de permiso o no existe
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
  postValidarTicket,
};
