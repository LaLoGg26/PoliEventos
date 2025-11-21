const mysql = require("mysql2/promise"); // Usamos la versión con 'promise' para Async/Await
const dbConfig = require("./db.config"); // Tu archivo de configuración de credenciales

// Crear el Pool de Conexiones
// Un Pool (Piscina) es mejor que una conexión directa, ya que maneja
// múltiples conexiones eficientemente para alta concurrencia.
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true, // Si todas las conexiones están en uso, espera
  connectionLimit: 10, // Máximo de conexiones concurrentes
  queueLimit: 0, // Cola de peticiones ilimitada
});

// Función de prueba para verificar la conexión al iniciar el servidor
async function testConnection() {
  try {
    // Obtener una conexión del pool para probar
    const connection = await pool.getConnection();
    console.log("✅ Conexión exitosa a la base de datos MySQL.");
    connection.release(); // Liberar la conexión
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    // Nota: Es mejor que el servidor no inicie si falla la DB
    process.exit(1);
  }
}

// Exportar tanto el pool para usarlo en controladores, como la función de prueba
module.exports = {
  pool,
  testConnection,
};
