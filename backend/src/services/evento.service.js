const { pool } = require("../config/db.connector");
const { v4: uuidv4 } = require("uuid");
const { generarYEnviarBoleto } = require("../utils/ticketGenerator");
const bcrypt = require("bcrypt");

// 1. Obtener lista
async function findAll() {
  const query =
    "SELECT id, nombre, fecha, lugar, imagen_url FROM eventos ORDER BY fecha ASC";
  const [rows] = await pool.query(query);
  return rows;
}

// 2. Obtener por ID
async function findById(eventoId) {
  const query = `
        SELECT 
            e.id, e.nombre, e.descripcion, e.fecha, e.lugar, e.imagen_url,
            e.latitud, e.longitud,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', b.id, 
                    'zona', b.nombre_zona, 
                    'precio', b.precio, 
                    'disponibles', (b.cantidad_total - b.cantidad_vendida),
                    'activo', b.activo 
                )
            ) AS boletos
        FROM eventos e
        LEFT JOIN boletos b ON e.id = b.evento_id
        WHERE e.id = ?
        GROUP BY e.id
    `;
  const [rows] = await pool.query(query, [eventoId]);
  if (rows.length === 0) return null;
  return rows[0];
}

// 3. Comprar Boletos
async function comprarBoletos(usuarioId, boletoId, cantidad) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT * FROM boletos WHERE id = ? FOR UPDATE",
      [boletoId]
    );
    if (rows.length === 0) throw new Error("Boleto no encontrado.");

    const boleto = rows[0];
    if (boleto.cantidad_total - boleto.cantidad_vendida < cantidad)
      throw new Error("Inventario insuficiente.");

    await connection.query(
      "UPDATE boletos SET cantidad_vendida = ? WHERE id = ?",
      [boleto.cantidad_vendida + cantidad, boletoId]
    );

    const total = Number(boleto.precio) * Number(cantidad);
    const [resCompra] = await connection.query(
      "INSERT INTO compras (usuario_id, boleto_id, cantidad, total, uuid_unico) VALUES (?, ?, ?, ?, ?)",
      [usuarioId, boletoId, cantidad, total, "MULTI"]
    );

    const compraId = resCompra.insertId;
    const listaUUIDs = [];
    const queryTicket =
      "INSERT INTO tickets (compra_id, uuid_unico) VALUES (?, ?)";

    for (let i = 0; i < cantidad; i++) {
      const uniqueCode = uuidv4();
      await connection.query(queryTicket, [compraId, uniqueCode]);
      listaUUIDs.push(uniqueCode);
    }

    const [userData] = await connection.query(
      "SELECT nombre, email FROM usuarios WHERE id = ?",
      [usuarioId]
    );
    const [eventoData] = await connection.query(
      "SELECT nombre, fecha, lugar FROM eventos WHERE id = ?",
      [boleto.evento_id]
    );
    const datosCompra = { id_compra: compraId, total, cantidad };

    generarYEnviarBoleto(
      listaUUIDs,
      eventoData[0],
      userData[0],
      boleto,
      datosCompra
    ).catch((err) => console.error("Error enviando correo:", err));

    await connection.commit();
    return {
      success: true,
      message: `Compra exitosa. Boletos enviados a ${userData[0].email}`,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 4. Crear Evento
async function createEvento(
  nombre,
  descripcion,
  fecha,
  lugar,
  imagen_url,
  usuario_id,
  tiposBoletos,
  latitud,
  longitud
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const queryEvento = `INSERT INTO eventos (nombre, descripcion, fecha, lugar, imagen_url, usuario_id, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [resultEvento] = await connection.query(queryEvento, [
      nombre,
      descripcion,
      fecha,
      lugar,
      imagen_url,
      usuario_id,
      latitud || null,
      longitud || null,
    ]);
    const eventoId = resultEvento.insertId;

    const queryBoleto = `INSERT INTO boletos (evento_id, nombre_zona, precio, cantidad_total, cantidad_vendida, activo) VALUES (?, ?, ?, ?, 0, 1)`;
    for (const boleto of tiposBoletos) {
      await connection.query(queryBoleto, [
        eventoId,
        boleto.nombre_zona,
        boleto.precio,
        boleto.cantidad_total,
      ]);
    }
    await connection.commit();
    return { id: eventoId, nombre };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 5. Dashboard
async function getEventsForDashboard(userId, userRole) {
  let query;
  const params = [];
  if (userRole === "SUPER_USER") {
    query = `
            SELECT e.id, e.nombre, e.fecha, e.lugar, u.nombre as vendedor_nombre, u.email as vendedor_email
            FROM eventos e JOIN usuarios u ON e.usuario_id = u.id ORDER BY e.fecha DESC
        `;
  } else {
    query =
      "SELECT id, nombre, fecha, lugar FROM eventos WHERE usuario_id = ? ORDER BY fecha DESC";
    params.push(userId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
}

// 6. Eliminar Evento
async function deleteEvento(eventoId, userId, userRole, password) {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      "SELECT password FROM usuarios WHERE id = ?",
      [userId]
    );
    if (users.length === 0) throw new Error("Usuario no encontrado.");

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) throw new Error("Contraseña incorrecta.");

    let checkQuery = "SELECT usuario_id FROM eventos WHERE id = ?";
    const [rows] = await connection.query(checkQuery, [eventoId]);
    if (rows.length === 0) throw new Error("Evento no encontrado.");
    if (userRole !== "SUPER_USER" && rows[0].usuario_id !== userId)
      throw new Error("No tienes permiso.");

    await connection.query("DELETE FROM eventos WHERE id = ?", [eventoId]);
    return true;
  } finally {
    connection.release();
  }
}

// 7. Actualizar Evento
async function updateEvento(eventoId, userId, userRole, data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let checkQuery = "SELECT usuario_id FROM eventos WHERE id = ?";
    const [rows] = await connection.query(checkQuery, [eventoId]);
    if (rows.length === 0) throw new Error("Evento no encontrado.");
    if (userRole !== "SUPER_USER" && rows[0].usuario_id !== userId)
      throw new Error("No tienes permiso.");

    const queryEvento = `UPDATE eventos SET nombre = ?, descripcion = ?, fecha = ?, lugar = ?, latitud = ?, longitud = ?, imagen_url = ? WHERE id = ?`;
    await connection.query(queryEvento, [
      data.nombre,
      data.descripcion,
      data.fecha,
      data.lugar,
      data.latitud,
      data.longitud,
      data.imagen_url,
      eventoId,
    ]);

    if (data.tiposBoletos && Array.isArray(data.tiposBoletos)) {
      for (const boleto of data.tiposBoletos) {
        if (boleto.id) {
          await connection.query("UPDATE boletos SET activo = ? WHERE id = ?", [
            boleto.activo ? 1 : 0,
            boleto.id,
          ]);
        } else {
          await connection.query(
            "INSERT INTO boletos (evento_id, nombre_zona, precio, cantidad_total, cantidad_vendida, activo) VALUES (?, ?, ?, ?, 0, 1)",
            [eventoId, boleto.nombre_zona, boleto.precio, boleto.cantidad_total]
          );
        }
      }
    }
    await connection.commit();
    return { id: eventoId, message: "Actualizado" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 8. Historial Wallet
async function getHistorialCompras(usuarioId) {
  const query = `
        SELECT c.id as compra_id, c.fecha_compra, c.total, c.cantidad, e.nombre as evento_nombre, e.fecha as evento_fecha, e.lugar as evento_lugar, e.imagen_url, b.nombre_zona,
            JSON_ARRAYAGG(JSON_OBJECT('uuid', IFNULL(t.uuid_unico, 'PENDIENTE'), 'estado', IFNULL(t.estado, 'DESCONOCIDO'))) as tickets
        FROM compras c
        JOIN boletos b ON c.boleto_id = b.id
        JOIN eventos e ON b.evento_id = e.id
        LEFT JOIN tickets t ON c.id = t.compra_id
        WHERE c.usuario_id = ? GROUP BY c.id ORDER BY c.fecha_compra DESC
    `;
  const [rows] = await pool.query(query, [usuarioId]);
  return rows;
}

// 9. Reenviar Correo
async function reenviarCorreoCompra(compraId, userId) {
  const queryInfo = `
        SELECT c.id as compra_id, c.total, c.cantidad, u.email as usuario_email, u.nombre as usuario_nombre, e.nombre as evento_nombre, e.fecha as evento_fecha, e.lugar as evento_lugar, b.nombre_zona, b.precio
        FROM compras c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN boletos b ON c.boleto_id = b.id
        JOIN eventos e ON b.evento_id = e.id
        WHERE c.id = ? AND c.usuario_id = ?
    `;
  const [rows] = await pool.query(queryInfo, [compraId, userId]);
  if (rows.length === 0) throw new Error("No encontrado.");
  const info = rows[0];
  const [rowsTickets] = await pool.query(
    "SELECT uuid_unico FROM tickets WHERE compra_id = ?",
    [compraId]
  );
  if (rowsTickets.length === 0) throw new Error("Compra antigua sin tickets.");

  const listaUUIDs = rowsTickets.map((t) => t.uuid_unico);
  const eventoObj = {
    nombre: info.evento_nombre,
    fecha: info.evento_fecha,
    lugar: info.evento_lugar,
  };
  const usuarioObj = { nombre: info.usuario_nombre, email: info.usuario_email };
  const boletoObj = { nombre_zona: info.nombre_zona, precio: info.precio };
  const datosCompra = {
    id_compra: info.compra_id,
    total: info.total,
    cantidad: info.cantidad,
  };

  await generarYEnviarBoleto(
    listaUUIDs,
    eventoObj,
    usuarioObj,
    boletoObj,
    datosCompra
  );
  return { success: true, message: `Correo reenviado a ${info.usuario_email}` };
}

// 10. Validar Ticket (Scanner) - ⭐️ CORREGIDO ⭐️
async function validarTicket(uuid, userId, userRole) {
  const connection = await pool.getConnection();
  try {
    const query = `
            SELECT t.id, t.estado, t.uuid_unico, e.nombre as evento_nombre, e.usuario_id as creador_id, b.nombre_zona
            FROM tickets t
            JOIN compras c ON t.compra_id = c.id
            JOIN boletos b ON c.boleto_id = b.id
            JOIN eventos e ON b.evento_id = e.id
            WHERE t.uuid_unico = ?
        `;
    const [rows] = await connection.query(query, [uuid]);

    if (rows.length === 0) throw new Error("Ticket NO VÁLIDO.");
    const ticket = rows[0];

    if (userRole !== "SUPER_USER" && ticket.creador_id !== userId) {
      throw new Error("⛔ Este ticket no pertenece a tus eventos.");
    }
    if (ticket.estado === "USADO") {
      return {
        valid: false,
        message: "Ticket YA USADO anteriormente.",
        data: ticket,
      };
    }

    // 🛠️ CORRECCIÓN AQUÍ: Comillas simples para el string 'USADO'
    await connection.query("UPDATE tickets SET estado = 'USADO' WHERE id = ?", [
      ticket.id,
    ]);

    return { valid: true, message: "✅ ACCESO CONCEDIDO", data: ticket };
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findById,
  comprarBoletos,
  createEvento,
  getEventsForDashboard,
  deleteEvento,
  updateEvento,
  getHistorialCompras,
  reenviarCorreoCompra,
  validarTicket,
};
