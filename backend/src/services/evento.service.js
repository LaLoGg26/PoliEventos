const { pool } = require("../config/db.connector");
const { v4: uuidv4 } = require("uuid"); // Importar UUID
const { generarYEnviarBoleto } = require("../utils/ticketGenerator");

// 1. Obtener lista de todos los eventos (Público)
async function findAll() {
  const query =
    "SELECT id, nombre, fecha, lugar, imagen_url FROM eventos ORDER BY fecha ASC";

  try {
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw new Error("No se pudieron cargar los eventos.");
  }
}

// 2. Obtener un evento y sus boletos (Público - Detalle)
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

  try {
    const [rows] = await pool.query(query, [eventoId]);
    if (rows.length === 0) return null;

    return rows[0];
  } catch (error) {
    console.error("Error al obtener evento por ID:", error);
    throw new Error("No se pudo cargar el detalle del evento.");
  }
}

// 3. Procesar la compra (Transacción)
async function comprarBoletos(usuarioId, boletoId, cantidad) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // A. Verificar Inventario
    const [rows] = await connection.query(
      "SELECT * FROM boletos WHERE id = ? FOR UPDATE",
      [boletoId]
    );
    if (rows.length === 0) throw new Error("Boleto no encontrado.");

    const boleto = rows[0];
    const disponibles = boleto.cantidad_total - boleto.cantidad_vendida;
    if (disponibles < cantidad) throw new Error("Inventario insuficiente.");

    // B. Actualizar Inventario
    const nuevaCantidadVendida = boleto.cantidad_vendida + cantidad;
    await connection.query(
      "UPDATE boletos SET cantidad_vendida = ? WHERE id = ?",
      [nuevaCantidadVendida, boletoId]
    );

    // C. Registrar Compra (Cabecera)
    const total = Number(boleto.precio) * Number(cantidad);

    // Nota: Ya no guardamos 'uuid_unico' en la tabla compras, ese campo puede quedar null o podemos quitarlo después.
    // Aquí insertamos la compra general.
    const [resCompra] = await connection.query(
      "INSERT INTO compras (usuario_id, boleto_id, cantidad, total, uuid_unico) VALUES (?, ?, ?, ?, ?)",
      [usuarioId, boletoId, cantidad, total, "MULTI-ORDER"] // Ponemos un placeholder o uuid general
    );

    const compraId = resCompra.insertId;
    const listaUUIDs = [];

    // D. Generar Tickets Individuales (El Bucle)
    const queryTicket =
      "INSERT INTO tickets (compra_id, uuid_unico) VALUES (?, ?)";

    for (let i = 0; i < cantidad; i++) {
      const uniqueCode = uuidv4(); // Código único para ESTE boleto
      await connection.query(queryTicket, [compraId, uniqueCode]);
      listaUUIDs.push(uniqueCode); // Lo guardamos para el PDF
    }

    // E. Obtener datos para correo
    const [userData] = await connection.query(
      "SELECT nombre, email FROM usuarios WHERE id = ?",
      [usuarioId]
    );
    const [eventoData] = await connection.query(
      "SELECT nombre, fecha, lugar FROM eventos WHERE id = ?",
      [boleto.evento_id]
    );

    const datosCompra = { id_compra: compraId, total, cantidad };

    // F. Enviar Correo (Pasamos la LISTA de UUIDs)
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
      message: `Compra exitosa. Se han enviado ${cantidad} boletos a ${userData[0].email}`,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 4. Crear Evento (Transacción - Múltiples Boletos y Mapa)
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

    // A. Insertar el Evento (8 parámetros)
    const queryEvento = `
            INSERT INTO eventos (nombre, descripcion, fecha, lugar, imagen_url, usuario_id, latitud, longitud) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
    // Si lat/long son undefined, se guardarán como NULL
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

    // B. Insertar los Tipos de Boletos
    const queryBoleto = `
            INSERT INTO boletos (evento_id, nombre_zona, precio, cantidad_total, cantidad_vendida, activo)
            VALUES (?, ?, ?, ?, 0, 1)
        `;

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

// 5. Obtener eventos para el Dashboard (Filtrado por Rol)
async function getEventsForDashboard(userId, userRole) {
  let query;
  const params = [];

  if (userRole === "SUPER_USER") {
    // El Admin ve TODO
    query = "SELECT id, nombre, fecha, lugar FROM eventos ORDER BY fecha DESC";
  } else {
    // El Vendedor solo ve los SUYOS
    query =
      "SELECT id, nombre, fecha, lugar FROM eventos WHERE usuario_id = ? ORDER BY fecha DESC";
    params.push(userId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

// 6. Eliminar Evento (Validación de Dueño)
async function deleteEvento(eventoId, userId, userRole) {
  // Verificar permisos primero
  let checkQuery = "SELECT usuario_id FROM eventos WHERE id = ?";
  const [rows] = await pool.query(checkQuery, [eventoId]);

  if (rows.length === 0) throw new Error("Evento no encontrado.");

  if (userRole !== "SUPER_USER" && rows[0].usuario_id !== userId) {
    throw new Error("No tienes permiso para eliminar este evento.");
  }

  await pool.query("DELETE FROM eventos WHERE id = ?", [eventoId]);
  return true;
}

// 7. Actualizar Evento (Datos + Boletos Híbridos)
async function updateEvento(eventoId, userId, userRole, data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // A. Verificar permisos
    let checkQuery = "SELECT usuario_id FROM eventos WHERE id = ?";
    const [rows] = await connection.query(checkQuery, [eventoId]);

    if (rows.length === 0) throw new Error("Evento no encontrado.");
    if (userRole !== "SUPER_USER" && rows[0].usuario_id !== userId) {
      throw new Error("No tienes permiso para editar este evento.");
    }

    // B. Actualizar Datos del Evento
    const queryEvento = `
            UPDATE eventos 
            SET nombre = ?, descripcion = ?, fecha = ?, lugar = ?, latitud = ?, longitud = ?, imagen_url = ?
            WHERE id = ?
        `;

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

    // C. Gestionar Boletos (Activar/Desactivar o Crear Nuevos)
    if (data.tiposBoletos && Array.isArray(data.tiposBoletos)) {
      for (const boleto of data.tiposBoletos) {
        if (boleto.id) {
          // SI TIENE ID -> Es existente, solo actualizamos 'activo'
          await connection.query("UPDATE boletos SET activo = ? WHERE id = ?", [
            boleto.activo ? 1 : 0,
            boleto.id,
          ]);
        } else {
          // NO TIENE ID -> Es nuevo, lo insertamos
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

// ... funciones anteriores ...

// 8. Obtener historial de compras del usuario (Wallet)
async function getHistorialCompras(usuarioId) {
  const query = `
        SELECT 
            c.id as compra_id,
            c.fecha_compra,
            c.total,
            c.cantidad,
            e.nombre as evento_nombre,
            e.fecha as evento_fecha,
            e.lugar as evento_lugar,
            e.imagen_url,
            b.nombre_zona,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'uuid', t.uuid_unico,
                    'estado', t.estado
                )
            ) as tickets
        FROM compras c
        JOIN boletos b ON c.boleto_id = b.id
        JOIN eventos e ON b.evento_id = e.id
        LEFT JOIN tickets t ON c.id = t.compra_id
        WHERE c.usuario_id = ?
        GROUP BY c.id
        ORDER BY c.fecha_compra DESC
    `;

  const [rows] = await pool.query(query, [usuarioId]);
  return rows;
}

// 9. Reenviar Correo (VERSIÓN ROBUSTA)
async function reenviarCorreoCompra(compraId, userId) {
  // 1. Obtener datos con alias muy claros para evitar confusiones
  const queryInfo = `
        SELECT 
            c.id as compra_id, 
            c.total, 
            c.cantidad,
            u.email as usuario_email, 
            u.nombre as usuario_nombre,
            e.nombre as evento_nombre, 
            e.fecha as evento_fecha, 
            e.lugar as evento_lugar,
            b.nombre_zona, 
            b.precio
        FROM compras c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN boletos b ON c.boleto_id = b.id
        JOIN eventos e ON b.evento_id = e.id
        WHERE c.id = ? AND c.usuario_id = ?
    `;

  const [rows] = await pool.query(queryInfo, [compraId, userId]);

  if (rows.length === 0) {
    throw new Error("No se encontró la compra o no tienes permiso.");
  }
  const info = rows[0];

  // 2. Obtener los UUIDs
  const [rowsTickets] = await pool.query(
    "SELECT uuid_unico FROM tickets WHERE compra_id = ?",
    [compraId]
  );

  if (rowsTickets.length === 0) {
    // Fallback: Si por alguna razón no hay tickets en la tabla tickets (compras viejas), generar uno temporal o lanzar error
    // Para este caso, asumiremos que si es una compra válida, debe tener tickets.
    // Si es una compra "vieja" (antes del sistema de tickets), esto fallará.
    throw new Error(
      "Esta compra es antigua y no tiene tickets generados para reenviar."
    );
  }

  const listaUUIDs = rowsTickets.map((t) => t.uuid_unico);

  // 3. Construir objetos para el PDF
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

  // 4. Enviar
  await generarYEnviarBoleto(
    listaUUIDs,
    eventoObj,
    usuarioObj,
    boletoObj,
    datosCompra
  );

  return {
    success: true,
    message: `Correo reenviado exitosamente a ${info.usuario_email}`,
  };
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
};
