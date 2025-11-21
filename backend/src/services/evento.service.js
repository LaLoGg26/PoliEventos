const { pool } = require("../config/db.connector");

// 1. Función para obtener la lista de todos los eventos
async function findAll() {
  const query =
    "SELECT id, nombre, fecha, lugar, imagen_url FROM eventos ORDER BY fecha ASC";

  try {
    // pool.query ejecuta la consulta directamente
    const [rows] = await pool.query(query);
    return rows; // Retorna el array de eventos
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw new Error("No se pudieron cargar los eventos.");
  }
}

// 2. Función para obtener un evento y sus boletos (un JOIN)
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
    // MySQL devuelve la columna JSON_ARRAYAGG como string, debemos parsearla
    evento.boletos = JSON.parse(evento.boletos);

    return evento;
  } catch (error) {
    console.error("Error al obtener evento por ID:", error);
    throw new Error("No se pudo cargar el detalle del evento.");
  }
}

module.exports = {
  findAll,
  findById,
};
