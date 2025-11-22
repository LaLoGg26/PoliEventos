const mysql = require("mysql2/promise");
const dbConfig = require("./db.config");

// Crear el Pool de Conexiones
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port: dbConfig.PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función de prueba para verificar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión exitosa a la base de datos MySQL.");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    process.exit(1);
  }
}

module.exports = {
  pool,
  testConnection,
};
