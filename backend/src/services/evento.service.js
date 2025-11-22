const { pool } = require("../config/db.connector");

// 1. Obtener lista de eventos
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

// 2. Obtener un evento y sus boletos
async function findById(eventoId) {
  const query = `
        SELECT 
            e.id, e.nombre, e.descripcion, e.fecha, e.lugar, e.imagen_url,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', b.id, 
                    'zona', b.nombre_zona, 
                    'precio', b.precio, 
                    'disponibles', (b.cantidad_total - b.cantidad_vendida)
                )
            ) AS boletos
        FROM eventos e
        JOIN boletos b ON e.id = b.evento_id
        WHERE e.id = ?
        GROUP BY e.id
    `;

  try {
    const [rows] = await pool.query(query, [eventoId]);
    if (rows.length === 0) return null;

    const evento = rows[0];
    // Parsear el array JSON que retorna MySQL
    // evento.boletos = JSON.parse(evento.boletos);

    return evento;
  } catch (error) {
    console.error("Error al obtener evento por ID:", error);
    throw new Error("No se pudo cargar el detalle del evento.");
  }
}

// 3. Procesar la compra (¡con Transacción!)
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

async function createEvento(
  nombre,
  descripcion,
  fecha,
  lugar,
  imagen_url,
  usuario_id
) {
  const connection = await pool.getConnection();
  try {
    const query = `
            INSERT INTO eventos (nombre, descripcion, fecha, lugar, imagen_url, usuario_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    const [result] = await connection.query(query, [
      nombre,
      descripcion,
      fecha,
      lugar,
      imagen_url,
      usuario_id,
    ]);

    return { id: result.insertId, nombre };
  } catch (error) {
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
};
