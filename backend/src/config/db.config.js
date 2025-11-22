// Este archivo obtiene las variables de entorno para la conexión a MySQL
const dbConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "1234",
  DB: process.env.DB_NAME || "poliEventos_db",
};

module.exports = dbConfig;
