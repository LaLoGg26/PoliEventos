const { pool } = require("../config/db.connector");

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
async function comprarBoletos(boletoId, cantidad) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT cantidad_total, cantidad_vendida FROM boletos WHERE id = ? FOR UPDATE",
      [boletoId]
    );

    if (rows.length === 0) {
      throw new Error("Boleto no encontrado.");
    }

    const boleto = rows[0];
    const disponibles = boleto.cantidad_total - boleto.cantidad_vendida;

    if (disponibles < cantidad) {
      throw new Error(
        `Inventario insuficiente. Solo quedan ${disponibles} boletos.`
      );
    }

    const nuevaCantidadVendida = boleto.cantidad_vendida + cantidad;
    await connection.query(
      "UPDATE boletos SET cantidad_vendida = ? WHERE id = ?",
      [nuevaCantidadVendida, boletoId]
    );

    await connection.commit();

    return { success: true, message: `Compra de ${cantidad} boletos exitosa.` };
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
            SET nombre = ?, descripcion = ?, fecha = ?, lugar = ?, latitud = ?, longitud = ?
            WHERE id = ?
        `;

    await connection.query(queryEvento, [
      data.nombre,
      data.descripcion,
      data.fecha,
      data.lugar,
      data.latitud,
      data.longitud,
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

module.exports = {
  findAll,
  findById,
  comprarBoletos,
  createEvento,
  getEventsForDashboard,
  deleteEvento,
  updateEvento,
};
